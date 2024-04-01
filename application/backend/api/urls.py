from django.urls import path
from .views import PredictionAPI
from optimization.views import RouteOptimizationAPI

urlpatterns = [
    path('predict/', PredictionAPI.as_view(), name='predict'),    
    path('routeoptimize/', RouteOptimizationAPI.as_view(), name='route-optimize'),
]
