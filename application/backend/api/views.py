from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class OptimizationAPI(APIView):
    def post(self, request):
        # Your optimization algorithm logic here
        result = {'message': 'Optimization successful!'}
        return Response(result, status=status.HTTP_200_OK)
# Create your views here.
