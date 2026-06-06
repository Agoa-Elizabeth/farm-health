from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/reports-over-time/', views.reports_over_time, name='reports-over-time'),
    path('dashboard/crop-distribution/', views.crop_distribution, name='crop-distribution'),
    path('dashboard/disease-distribution/', views.disease_distribution, name='disease-distribution'),
    path('outbreaks/', views.outbreak_data, name='outbreak-data'),
    path('admin/analytics/', views.admin_analytics, name='admin-analytics'),
]
