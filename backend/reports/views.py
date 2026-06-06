from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Report, Advisory
from .serializers import (
    ReportListSerializer, ReportDetailSerializer, ReportCreateSerializer,
    ReportStatusUpdateSerializer, AdvisorySerializer,
)
from .disease_engine import analyze_symptoms
from .advisory_engine import generate_advisory


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.select_related('user', 'advisory').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['crop_type', 'disease', 'severity', 'status']
    search_fields = ['farmer_name', 'location', 'disease']
    ordering_fields = ['created_at', 'severity', 'status']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        elif self.action == 'create':
            return ReportCreateSerializer
        elif self.action in ('partial_update', 'update') and 'status' in self.request.data:
            return ReportStatusUpdateSerializer
        return ReportDetailSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ('destroy',):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == 'farmer':
            qs = qs.filter(user=user)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(user=self.request.user)

        crop_type = report.crop_type
        symptoms = report.symptoms

        disease_key, disease_name, description, severity, confidence = analyze_symptoms(
            crop_type, symptoms
        )

        if disease_key:
            report.disease = disease_key
            report.severity = severity
            report.confidence = confidence
            report.save()

            advisory_data = generate_advisory(disease_key, severity)
            if advisory_data:
                Advisory.objects.create(
                    report=report,
                    disease_name=advisory_data['disease_name'],
                    description=advisory_data['description'],
                    severity=severity,
                    treatment=advisory_data['treatment'],
                    prevention=advisory_data['prevention'],
                    best_practices=advisory_data['best_practices'],
                )

        return Response(
            ReportDetailSerializer(report, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def my(self, request):
        qs = Report.objects.filter(user=request.user).select_related('advisory')
        page = self.paginate_queryset(qs)
        if page:
            serializer = ReportListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ReportListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def advisory(self, request, pk=None):
        report = self.get_object()
        try:
            adv = report.advisory
            return Response(AdvisorySerializer(adv).data)
        except Advisory.DoesNotExist:
            return Response({'error': 'No advisory generated yet'}, status=404)

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        report = self.get_object()
        serializer = ReportStatusUpdateSerializer(report, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        serializer.save()
        return Response(ReportDetailSerializer(report).data)
