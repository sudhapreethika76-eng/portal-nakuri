from django.contrib import admin
from .models import Profile, Job, JobView, JobApplication

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'location', 'experience', 'salary', 'vacancies', 'posted_by', 'posted_date')
    list_filter = ('job_type', 'location', 'posted_date')
    search_fields = ('title', 'company_name', 'skills')


@admin.register(JobView)
class JobViewAdmin(admin.ModelAdmin):
    list_display = ('job', 'viewer', 'viewed_at')
    search_fields = ('job__title', 'viewer__username')


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'applicant', 'full_name', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('job__title', 'applicant__username', 'full_name')
