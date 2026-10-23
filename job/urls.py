from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.api_register, name='register'),
    path('login/', views.api_login, name='login'),
    
    # Jobs APIs
    path('jobs/', views.job_list_create_api, name='job_list_create'),
    path('jobs/<int:pk>/', views.job_detail_api, name='job_detail'),
    path('jobs/<int:jobId>/apply/', views.job_apply_api, name='job_apply'),
    
    # Student Notifications API
    path('student/notifications/', views.student_notifications_api, name='student_notifications'),
    
    # Recruiter APIs
    path('recruiter/dashboard/', views.recruiter_dashboard_api, name='recruiter_dashboard'),
    path('recruiter/job/<int:jobId>/candidates/', views.recruiter_job_candidates_api, name='recruiter_job_candidates'),
    path('recruiter/jobs/<int:jobId>/candidates/', views.recruiter_job_candidates_api, name='recruiter_job_candidates_plural'),
    path('recruiter/applications/<int:appId>/', views.candidate_info_api, name='recruiter_candidate_info'),
    path('recruiter/applications/<int:appId>/update/', views.update_application_status_api, name='recruiter_update_application_status'),
    
    # Candidate APIs
    path('candidate/<int:appId>/', views.candidate_info_api, name='candidate_info'),
    path('candidate/<int:appId>/status/', views.update_application_status_api, name='update_application_status'),
    
    # Admin APIs
    path('admin/users/', views.admin_users_list_api, name='admin_users_list'),
    path('admin/users/<int:userId>/', views.admin_user_delete_api, name='admin_user_delete'),
]