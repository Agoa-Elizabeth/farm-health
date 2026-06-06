from django.db.models import Count, Q
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from reports.models import Report, Advisory


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    queryset = Report.objects.all()
    if user.role == 'farmer':
        queryset = queryset.filter(user=user)

    total = queryset.count()
    high_critical = queryset.filter(
        severity__in=['high', 'critical']
    ).count()
    pending = queryset.filter(status='pending').count()
    resolved = queryset.filter(status='resolved').count()

    return Response({
        'total_reports': total,
        'high_critical_cases': high_critical,
        'pending_reviews': pending,
        'resolved_cases': resolved,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports_over_time(request):
    user = request.user
    queryset = Report.objects.all()
    if user.role == 'farmer':
        queryset = queryset.filter(user=user)

    months = (
        queryset
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    return Response([
        {'month': m['month'].strftime('%Y-%m'), 'count': m['count']}
        for m in months
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def crop_distribution(request):
    user = request.user
    queryset = Report.objects.all()
    if user.role == 'farmer':
        queryset = queryset.filter(user=user)

    crops = (
        queryset
        .values('crop_type')
        .annotate(count=Count('id'))
    )

    labels = {'banana': 'Banana', 'coffee': 'Coffee'}
    return Response([
        {'crop': labels.get(c['crop_type'], c['crop_type']), 'count': c['count']}
        for c in crops
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def disease_distribution(request):
    user = request.user
    queryset = Report.objects.all()
    if user.role == 'farmer':
        queryset = queryset.filter(user=user)

    diseases = (
        queryset
        .exclude(disease__isnull=True)
        .values('disease')
        .annotate(count=Count('id'))
    )

    disease_labels = dict(Report.Disease.choices)
    return Response([
        {'disease': disease_labels.get(d['disease'], d['disease']), 'count': d['count']}
        for d in diseases
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def outbreak_data(request):
    reports = Report.objects.exclude(
        latitude__isnull=True, longitude__isnull=True
    ).exclude(
        disease__isnull=True
    ).values(
        'id', 'latitude', 'longitude', 'disease', 'severity',
        'crop_type', 'farmer_name', 'location', 'created_at'
    )

    disease_labels = dict(Report.Disease.choices)
    data = []
    for r in reports:
        data.append({
            'id': r['id'],
            'lat': float(r['latitude']),
            'lng': float(r['longitude']),
            'disease': disease_labels.get(r['disease'], r['disease']),
            'disease_key': r['disease'],
            'severity': r['severity'],
            'crop_type': r['crop_type'],
            'farmer_name': r['farmer_name'],
            'location': r['location'],
            'created_at': r['created_at'].isoformat() if r['created_at'] else None,
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics(request):
    total_farmers = User.objects.filter(role='farmer', is_active=True).count()
    total_reports = Report.objects.count()

    disease_dist = (
        Report.objects
        .exclude(disease__isnull=True)
        .values('disease')
        .annotate(count=Count('id'))
    )

    monthly_trends = (
        Report.objects
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    region_stats = (
        Report.objects
        .exclude(location='')
        .values('location')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )

    severity_stats = (
        Report.objects
        .values('severity')
        .annotate(count=Count('id'))
    )

    return Response({
        'total_farmers': total_farmers,
        'total_reports': total_reports,
        'disease_distribution': [
            {'disease': dict(Report.Disease.choices).get(d['disease'], d['disease']), 'count': d['count']}
            for d in disease_dist
        ],
        'monthly_trends': [
            {'month': m['month'].strftime('%Y-%m'), 'count': m['count']}
            for m in monthly_trends
        ],
        'regional_stats': [
            {'location': r['location'], 'count': r['count']}
            for r in region_stats
        ],
        'severity_stats': {
            s['severity']: s['count'] for s in severity_stats
        },
    })
