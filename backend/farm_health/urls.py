import os

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.views.static import serve as static_serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from accounts.views_admin import AdminUserViewSet
from reports.views_admin import (
    AdminReportViewSet, AdminAdvisoryViewSet, AdminNotificationViewSet,
    admin_ai_monitoring, admin_media_list,
    export_reports_csv, export_analytics_csv,
    farmer_report_history,
)


def frontend_spa(request):
    return render(request, 'index.html')


router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/reports', AdminReportViewSet, basename='admin-reports')
router.register(r'admin/advisories', AdminAdvisoryViewSet, basename='admin-advisories')
router.register(r'admin/notifications', AdminNotificationViewSet, basename='admin-notifications')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('reports.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include(router.urls)),
    path('api/admin/ai-monitoring/', admin_ai_monitoring, name='admin-ai-monitoring'),
    path('api/admin/media/', admin_media_list, name='admin-media'),
    path('api/admin/exports/reports/csv/', export_reports_csv, name='export-reports-csv'),
    path('api/admin/exports/analytics/csv/', export_analytics_csv, name='export-analytics-csv'),
    path('api/admin/farmers/<int:farmer_id>/reports/', farmer_report_history, name='farmer-report-history'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', static_serve, {
            'document_root': os.path.join(settings.BASE_DIR, '..', 'frontend', 'dist', 'assets')
        }),
    ]

urlpatterns += [
    re_path(r'^.*$', frontend_spa),
]
