from django.urls import path
from .views import OptimizationAPI
from .views import LocationSetAPI

urlpatterns = [
    path('optimize/', OptimizationAPI.as_view(), name='optimize'),
    path('getlocations/', LocationSetAPI.as_view(), name='location-api')
    path('routeoptimize/', RouteOptimizationAPI.as_view(), name='route-optimize')
]
