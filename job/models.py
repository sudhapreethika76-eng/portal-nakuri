from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('recruiter', 'Recruiter'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Job(models.Model):
    posted_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='job_postings'
    )
    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    experience = models.CharField(max_length=50)
    salary = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50)
    skills = models.CharField(max_length=300)
    description = models.TextField()
    qualification = models.CharField(max_length=200)
    vacancies = models.IntegerField(default=1)
    posted_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.company_name}"


class JobView(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='views')
    viewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='viewed_jobs')
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'viewer')

    def __str__(self):
        return f"{self.viewer.username} viewed {self.job.title}"


class JobApplication(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    
    # Form Details
    full_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    education = models.CharField(max_length=200, blank=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')

    class Meta:
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f"{self.applicant.username} - {self.job.title} ({self.status})"