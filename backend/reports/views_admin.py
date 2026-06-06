from rest_framework import viewsets, permissions
from .models import Report
from .serializers import ReportListSerializer, ReportStatusUpdateSerializer


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class AdminReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Report.objects.select_related('user', 'advisory').all()
    serializer_class = ReportListSerializer
    permission_classes = [IsAdmin]
