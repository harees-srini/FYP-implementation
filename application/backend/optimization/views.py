from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# Create your views here.


class RouteOptimizationAPI(APIView):
    def post(self, request):
        # Your optimization algorithm logic here
        result = request.data
        print("Optimizasgsrggsss workingg!!")
        print(result)
        return Response({'status': 'success'}, status=status.HTTP_200_OK)