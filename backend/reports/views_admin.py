import csv
from django.http import HttpResponse
from django.db.models import Count, Q, Avg
from django.utils import timezone
from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import Report, Advisory, Notification
from .serializers import (
    ReportListSerializer, ReportDetailSerializer, ReportAdminUpdateSerializer,
    AdvisorySerializer, AdvisoryCreateSerializer, NotificationSerializer,
)
from accounts.models import User
from accounts.serializers import UserSerializer


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class AdminReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.select_related('user', 'advisory').all()
    permission_classes = [IsAdmin]
    http_method_names = ['get', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ReportDetailSerializer
        if self.action in ('partial_update', 'update'):
            return ReportAdminUpdateSerializer
        return ReportListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get('status')
        severity = self.request.query_params.get('severity')
        crop = self.request.query_params.get('crop_type')
        disease = self.request.query_params.get('disease')
        search = self.request.query_params.get('search')
        if status:
            qs = qs.filter(status=status)
        if severity:
            qs = qs.filter(severity=severity)
        if crop:
            qs = qs.filter(crop_type=crop)
        if disease:
            qs = qs.filter(disease=disease)
        if search:
            qs = qs.filter(
                Q(farmer_name__icontains=search) |
                Q(location__icontains=search) |
                Q(id__icontains=search)
            )
        return qs


class AdminAdvisoryViewSet(viewsets.ModelViewSet):
    queryset = Advisory.objects.select_related('report').all()
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return AdvisoryCreateSerializer
        return AdvisorySerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        advisory = self.get_object()
        advisory.is_approved = True
        advisory.save()
        return Response(AdvisorySerializer(advisory).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        advisory = self.get_object()
        advisory.is_approved = False
        advisory.save()
        return Response(AdvisorySerializer(advisory).data)


class AdminNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdmin]
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return Notification.objects.all()

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(is_read=False).count()
        return Response({'unread_count': count})


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_ai_monitoring(request):
    total = Report.objects.count()
    with_prediction = Report.objects.exclude(disease__isnull=True).count()
    without_prediction = Report.objects.filter(disease__isnull=True).count()

    avg_confidence = Report.objects.exclude(confidence__isnull=True).aggregate(
        avg=Avg('confidence')
    )['avg'] or 0

    confidence_dist = (
        Report.objects
        .exclude(confidence__isnull=True)
        .values('confidence')
        .annotate(count=Count('id'))
    )

    low_conf = Report.objects.filter(
        disease__isnull=False,
        confidence__lt=0.5
    ).count()
    med_conf = Report.objects.filter(
        disease__isnull=False,
        confidence__gte=0.5, confidence__lt=0.75
    ).count()
    high_conf = Report.objects.filter(
        disease__isnull=False,
        confidence__gte=0.75
    ).count()

    pending_review = Report.objects.filter(
        disease__isnull=True, status='pending'
    ).count()

    return Response({
        'total_predictions': with_prediction,
        'without_prediction': without_prediction,
        'average_confidence': round(avg_confidence * 100, 1),
        'confidence_distribution': {
            'low': low_conf,
            'medium': med_conf,
            'high': high_conf,
        },
        'pending_manual_review': pending_review,
        'total_reports': total,
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_media_list(request):
    reports_with_images = Report.objects.exclude(image='').exclude(image__isnull=True).values(
        'id', 'image', 'farmer_name', 'crop_type', 'disease', 'created_at'
    )
    data = []
    for r in reports_with_images:
        data.append({
            'id': r['id'],
            'image_url': r['image'].url if hasattr(r['image'], 'url') else '',
            'farmer_name': r['farmer_name'],
            'crop_type': r['crop_type'],
            'disease': r['disease'],
            'created_at': r['created_at'].isoformat() if r['created_at'] else None,
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def export_reports_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="reports_export.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Farmer Name', 'Contact', 'Location', 'Crop Type',
        'Disease', 'Severity', 'Confidence', 'Status', 'Admin Notes',
        'Created At', 'Updated At'
    ])

    reports = Report.objects.select_related('user').all().values_list(
        'id', 'farmer_name', 'contact_info', 'location', 'crop_type',
        'disease', 'severity', 'confidence', 'status', 'admin_notes',
        'created_at', 'updated_at'
    )
    for r in reports:
        writer.writerow(r)

    return response


@api_view(['GET'])
@permission_classes([IsAdmin])
def export_analytics_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="analytics_export.csv"'

    writer = csv.writer(response)
    writer.writerow(['Metric', 'Value'])
    writer.writerow(['Total Farmers', User.objects.filter(role='farmer').count()])
    writer.writerow(['Total Reports', Report.objects.count()])
    writer.writerow(['Pending Reports', Report.objects.filter(status='pending').count()])
    writer.writerow(['Reviewed Reports', Report.objects.filter(status='reviewed').count()])
    writer.writerow(['Resolved Reports', Report.objects.filter(status='resolved').count()])
    writer.writerow(['High/Critical Cases', Report.objects.filter(severity__in=['high', 'critical']).count()])
    writer.writerow(['With Disease Prediction', Report.objects.exclude(disease__isnull=True).count()])
    writer.writerow(['Without Prediction', Report.objects.filter(disease__isnull=True).count()])

    writer.writerow([])
    writer.writerow(['Disease Distribution'])
    writer.writerow(['Disease', 'Count'])
    for item in Report.objects.exclude(disease__isnull=True).values('disease').annotate(count=Count('id')):
        writer.writerow([item['disease'], item['count']])

    return response


@api_view(['GET'])
@permission_classes([IsAdmin])
def farmer_report_history(request, farmer_id):
    try:
        farmer = User.objects.get(id=farmer_id, role='farmer')
    except User.DoesNotExist:
        return Response({'error': 'Farmer not found'}, status=404)

    reports = Report.objects.filter(user=farmer).select_related('advisory')
    serializer = ReportListSerializer(reports, many=True)
    farmer_data = UserSerializer(farmer).data
    return Response({
        'farmer': farmer_data,
        'reports': serializer.data,
        'total_reports': reports.count(),
    })
