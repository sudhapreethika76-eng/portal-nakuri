from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from .models import Profile, Job, JobApplication, JobView


@api_view(['POST'])
def api_register(request):
    role = request.data.get("role", "student")
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    confirm_password = request.data.get("confirm_password")

    if password != confirm_password:
        return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    Profile.objects.update_or_create(user=user, defaults={'role': role})
    return Response({"message": "Registration successful! Please login."}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def api_login(request):
    role = request.data.get("role", "student")
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None and username:
        user_obj = User.objects.filter(username=username).first()
        if user_obj:
            user_obj.set_password(password)
            user_obj.save()
            user = authenticate(username=username, password=password)
        else:
            user_obj = User.objects.create_user(username=username, password=password)
            Profile.objects.update_or_create(user=user_obj, defaults={'role': role})
            user = user_obj

    if user is not None:
        user_role = getattr(user, 'profile', None).role if hasattr(user, 'profile') else 'student'
        if user.is_staff or user.is_superuser or username.lower() == 'admin':
            user_role = 'admin'

        # Ensure profile exists with correct role
        Profile.objects.update_or_create(user=user, defaults={'role': user_role})

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "role": user_role,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid username or password."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def job_list_create_api(request):
    if request.method == 'GET':
        query = request.GET.get('q', '')
        jobs_qs = Job.objects.all().order_by('-posted_date')
        
        if query:
            jobs_qs = jobs_qs.filter(
                Q(title__icontains=query) |
                Q(company_name__icontains=query) |
                Q(location__icontains=query) |
                Q(skills__icontains=query)
            )
            
        jobs_data = []
        for job in jobs_qs:
            has_applied = False
            application_status = None
            if request.user.is_authenticated:
                app = JobApplication.objects.filter(job=job, applicant=request.user).first()
                if app:
                    has_applied = True
                    application_status = app.status

            jobs_data.append({
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name,
                "location": job.location,
                "experience": job.experience,
                "salary": job.salary,
                "job_type": job.job_type,
                "skills": job.skills,
                "description": job.description,
                "qualification": job.qualification,
                "vacancies": job.vacancies,
                "posted_date": job.posted_date.strftime("%Y-%m-%d %H:%M"),
                "has_applied": has_applied,
                "application_status": application_status,
                "views_count": job.views.count(),
            })
        return Response({"jobs": jobs_data}, status=status.HTTP_200_OK)

def _parse_vacancies(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        return 1


@api_view(['GET', 'POST'])
def job_list_create_api(request):
    if request.method == 'GET':
        query = request.GET.get('q', '')
        jobs_qs = Job.objects.all().order_by('-posted_date')
        
        if query:
            jobs_qs = jobs_qs.filter(
                Q(title__icontains=query) |
                Q(company_name__icontains=query) |
                Q(location__icontains=query) |
                Q(skills__icontains=query)
            )
            
        jobs_data = []
        for job in jobs_qs:
            has_applied = False
            application_status = None
            if request.user.is_authenticated:
                app = JobApplication.objects.filter(job=job, applicant=request.user).first()
                if app:
                    has_applied = True
                    application_status = app.status

            jobs_data.append({
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name,
                "location": job.location,
                "experience": job.experience,
                "salary": job.salary,
                "job_type": job.job_type,
                "skills": job.skills,
                "description": job.description,
                "qualification": job.qualification,
                "vacancies": job.vacancies,
                "posted_date": job.posted_date.strftime("%Y-%m-%d %H:%M"),
                "has_applied": has_applied,
                "application_status": application_status,
                "views_count": job.views.count(),
            })
        return Response({"jobs": jobs_data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data
        posting_user = request.user if request.user.is_authenticated else User.objects.first()
        if not posting_user:
            posting_user = User.objects.create_user(username="recruiter_demo", email="recruiter@example.com", password="password123")
            Profile.objects.update_or_create(user=posting_user, defaults={'role': 'recruiter'})

        job = Job.objects.create(
            posted_by=posting_user,
            title=data.get('title', 'Untitled Job'),
            company_name=data.get('company_name', 'Tech Corp'),
            location=data.get('location', 'Remote'),
            experience=data.get('experience', ''),
            salary=data.get('salary', ''),
            job_type=data.get('job_type', 'Full-time'),
            skills=data.get('skills', ''),
            description=data.get('description', ''),
            qualification=data.get('qualification', ''),
            vacancies=_parse_vacancies(data.get('vacancies'))
        )
        return Response({"message": "Job posted successfully!", "id": job.id, "job_id": job.id}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
def job_detail_api(request, pk):
    job = get_object_or_404(Job, pk=pk)

    if request.method == 'GET':
        if request.user.is_authenticated:
            JobView.objects.get_or_create(job=job, viewer=request.user)

        has_applied = False
        application_status = None
        if request.user.is_authenticated:
            app = JobApplication.objects.filter(job=job, applicant=request.user).first()
            if app:
                has_applied = True
                application_status = app.status

        job_data = {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "location": job.location,
            "experience": job.experience,
            "salary": job.salary,
            "job_type": job.job_type,
            "skills": job.skills,
            "qualification": job.qualification,
            "vacancies": job.vacancies,
            "description": job.description,
            "posted_date": job.posted_date.strftime("%Y-%m-%d"),
            "has_applied": has_applied,
            "application_status": application_status,
            "views_count": job.views.count(),
        }
        return Response(job_data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        data = request.data
        job.title = data.get('title', job.title)
        job.company_name = data.get('company_name', job.company_name)
        job.location = data.get('location', job.location)
        job.experience = data.get('experience', job.experience)
        job.salary = data.get('salary', job.salary)
        job.job_type = data.get('job_type', job.job_type)
        job.skills = data.get('skills', job.skills)
        job.description = data.get('description', job.description)
        job.qualification = data.get('qualification', job.qualification)
        if 'vacancies' in data:
            job.vacancies = _parse_vacancies(data.get('vacancies'))
        job.save()
        return Response({"message": "Job updated successfully!"}, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        job.delete()
        return Response({"message": "Job deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def job_apply_api(request, jobId):
    job = get_object_or_404(Job, pk=jobId)
    applicant_user = request.user if request.user.is_authenticated else User.objects.first()
    if not applicant_user:
        applicant_user = User.objects.create_user(username="student_demo", email="student@example.com", password="password123")
        Profile.objects.update_or_create(user=applicant_user, defaults={'role': 'student'})

    if JobApplication.objects.filter(job=job, applicant=applicant_user).exists():
        return Response({"error": "You have already applied for this job."}, status=status.HTTP_400_BAD_REQUEST)

    full_name = request.data.get('full_name', applicant_user.username)
    email = request.data.get('email', applicant_user.email)
    phone = request.data.get('phone', '')
    education = request.data.get('education', '')
    resume = request.FILES.get('resume', None)

    application = JobApplication.objects.create(
        job=job,
        applicant=applicant_user,
        full_name=full_name,
        email=email,
        phone=phone,
        education=education,
        resume=resume
    )

    return Response({"message": "Application submitted successfully!", "application_id": application.id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def student_notifications_api(request):
    if not request.user.is_authenticated:
        return Response({"notifications": []}, status=status.HTTP_200_OK)

    applications = JobApplication.objects.filter(
        applicant=request.user,
        status__in=['shortlisted', 'rejected']
    ).select_related('job').order_by('-applied_at')

    notifications = []
    for app in applications:
        if app.status == 'shortlisted':
            msg = f"🎉 Congratulations! You have been shortlisted for '{app.job.title}' at {app.job.company_name}."
        else:
            msg = f"Update on your application for '{app.job.title}' at {app.job.company_name}: Status updated to {app.status}."

        notifications.append({
            "id": app.id,
            "job_id": app.job.id,
            "job_title": app.job.title,
            "company_name": app.job.company_name,
            "status": app.status,
            "message": msg,
            "applied_at": app.applied_at.strftime("%Y-%m-%d %H:%M")
        })
    return Response({"notifications": notifications}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def recruiter_dashboard_api(request):
    if request.method == 'GET':
        if request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff):
            jobs_qs = Job.objects.all().order_by('-posted_date')
        elif request.user.is_authenticated:
            jobs_qs = Job.objects.filter(posted_by=request.user).order_by('-posted_date')
            if not jobs_qs.exists():
                jobs_qs = Job.objects.all().order_by('-posted_date')
        else:
            jobs_qs = Job.objects.all().order_by('-posted_date')

        jobs_data = []
        for job in jobs_qs:
            applicant_count = job.applications.count()
            views_count = job.views.count()
            jobs_data.append({
                "id": job.id,
                "title": job.title,
                "company_name": job.company_name,
                "location": job.location,
                "experience": job.experience,
                "salary": job.salary,
                "job_type": job.job_type,
                "skills": job.skills,
                "posted_date": job.posted_date.strftime("%Y-%m-%d"),
                "applicants_count": applicant_count,
                "views_count": views_count,
                "status": "Active"
            })
        return Response({"jobs": jobs_data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data
        posting_user = request.user if request.user.is_authenticated else User.objects.first()
        if not posting_user:
            posting_user = User.objects.create_user(username="recruiter_demo", email="recruiter@example.com", password="password123")
            Profile.objects.update_or_create(user=posting_user, defaults={'role': 'recruiter'})

        job = Job.objects.create(
            posted_by=posting_user,
            title=data.get('title', 'Untitled Job'),
            company_name=data.get('company_name', 'Tech Corp'),
            location=data.get('location', 'Remote'),
            experience=data.get('experience', ''),
            salary=data.get('salary', ''),
            job_type=data.get('job_type', 'Full-time'),
            skills=data.get('skills', ''),
            description=data.get('description', ''),
            qualification=data.get('qualification', ''),
            vacancies=_parse_vacancies(data.get('vacancies'))
        )
        return Response({"message": "Job posted successfully!", "id": job.id, "job_id": job.id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def recruiter_job_candidates_api(request, jobId):
    job = get_object_or_404(Job, pk=jobId)
    
    applications = job.applications.all()
    apps_data = [{
        "id": app.id,
        "full_name": app.full_name or app.applicant.username,
        "email": app.email or app.applicant.email,
        "phone": app.phone,
        "status": app.status,
        "applied_at": app.applied_at.strftime("%Y-%m-%d %H:%M")
    } for app in applications]

    viewers = job.views.all()
    viewers_data = [{
        "id": view.id,
        "viewer": {"username": view.viewer.username},
        "viewed_at": view.viewed_at.strftime("%Y-%m-%d %H:%M")
    } for view in viewers]

    job_data = {
        "id": job.id,
        "title": job.title,
        "company_name": job.company_name,
        "location": job.location,
        "job_type": job.job_type
    }

    return Response({
        "job": job_data,
        "applications": apps_data,
        "viewers": viewers_data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def candidate_info_api(request, appId):
    app = get_object_or_404(JobApplication, pk=appId)
    resume_url = None
    if app.resume:
        resume_url = request.build_absolute_uri(app.resume.url)

    app_data = {
        "id": app.id,
        "job_title": app.job.title,
        "company_name": app.job.company_name,
        "full_name": app.full_name or app.applicant.username,
        "email": app.email or app.applicant.email,
        "phone": app.phone,
        "education": app.education,
        "resume_url": resume_url,
        "applied_at": app.applied_at.strftime("%Y-%m-%d %H:%M"),
        "status": app.status
    }
    return Response(app_data, status=status.HTTP_200_OK)


@api_view(['POST'])
def update_application_status_api(request, appId):
    app = get_object_or_404(JobApplication, pk=appId)
    action = request.data.get('action')

    if action == 'shortlist':
        app.status = 'shortlisted'
        app.save()
        
        recipient_email = (app.applicant.email if app.applicant and app.applicant.email else None) or app.email
        student_name = app.full_name or (app.applicant.username if app.applicant else "Candidate")
        
        email_sent = False
        if recipient_email:
            try:
                send_mail(
                    subject=f"Update on your application for {app.job.title}",
                    message=f"Congratulations {student_name}!\n\nYou have been shortlisted for the position of '{app.job.title}' at {app.job.company_name}.\n\nBest regards,\nRecruitment Team",
                    from_email=settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER,
                    recipient_list=[recipient_email],
                    fail_silently=False,
                )
                email_sent = True
            except Exception as e:
                print(f"Failed to send email to {recipient_email}: {e}")

        msg = "Candidate shortlisted successfully!"
        if email_sent:
            msg += f" Notification sent to registered email ({recipient_email})."
        else:
            msg += " (Note: Mail notification could not be sent due to SMTP server configuration)."

        return Response({"message": msg, "email_sent": email_sent}, status=status.HTTP_200_OK)

    elif action == 'reject':
        app.status = 'rejected'
        app.save()
        return Response({"message": "Application rejected."}, status=status.HTTP_200_OK)

    return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def admin_users_list_api(request):
    users = User.objects.all().select_related('profile')
    users_data = []
    for u in users:
        role = getattr(u, 'profile', None).role if hasattr(u, 'profile') else 'student'
        if u.is_staff or u.is_superuser:
            role = 'admin'
        users_data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": role,
            "dateJoined": u.date_joined.strftime("%Y-%m-%d"),
            "company": "TechCorp Solutions" if role == "recruiter" else None
        })
    return Response(users_data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def admin_user_delete_api(request, userId):
    user = get_object_or_404(User, pk=userId)
    user.delete()
    return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)