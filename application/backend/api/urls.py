from django.urls import path
from .views import OptimizationAPI

urlpatterns = [
    path('optimize/', OptimizationAPI.as_view(), name='optimize'),
]
