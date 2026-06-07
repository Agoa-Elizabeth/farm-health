from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from accounts.views_admin import AdminUserViewSet
from reports.views_admin import AdminReportViewSet


def home(request):
    return JsonResponse({
        'message': 'Farm Health Advisory API',
        'version': '1.0.0',
        'endpoints': {
            'docs': '/api/docs/',
            'schema': '/api/schema/',
            'auth': '/api/auth/',
            'admin': '/admin/',
        }
    })

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/reports', AdminReportViewSet, basename='admin-reports')

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('reports.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include(router.urls)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
