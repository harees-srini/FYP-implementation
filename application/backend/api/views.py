from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class OptimizationAPI(APIView):
    def post(self, request):
        # Your optimization algorithm logic here
        result = {'message': 'Optimization successful!!!'}
        print("I'm workingg!!")
        return Response(result, status=status.HTTP_200_OK)

class LocationSetAPI(APIView):
    def post(Self, request):
        #Retreive message from req data
        message = request.data.get('message', None)
        
        if message is not None:
            #Process message and do something
            
            #return response
            return Response({'message': 'Message successfully received'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)
