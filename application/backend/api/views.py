from django.shortcuts import render
from django.contrib.staticfiles import finders
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from keras.models import load_model

class OptimizationAPI(APIView):
    def post(self, request):
        # Your optimization algorithm logic here
        result = request.data

        print("I'm workingg!!")
        print(result)

        columns = [
        'timeOfDay_Evening', 'timeOfDay_Morning', 'timeOfDay_Night',
        'locationType_Beaches and Parks', 'locationType_Miscellaneous',
        'locationType_Museums and Galleries', 'locationType_Religious Site',
        'locationType_Shopping Center', 'placeID_ChIJ29ux5BlZ4joRqIYssICvt2w',
        'placeID_ChIJ2fnv9CxZ4joRsFXQ14mM27Q','placeID_ChIJ4zP25CFZ4joR5oPveZLBwLA',
        'placeID_ChIJ9asnzG9Z4joRpzOYo3-ENCk','placeID_ChIJBfNyajlZ4joRbxOUv8Ykfl4',
        'placeID_ChIJC46ViHtZ4joRCya8Jp8IxcE','placeID_ChIJQ9yCmWtZ4joRNu1evW41NTo',
        'placeID_ChIJTXbn3s9b4joRxbASabb7l98','placeID_ChIJYZELmiFZ4joRKmKnrRRtj9g',
        'placeID_ChIJZRPdHihY4joRRH3j8j-i36Y','placeID_ChIJiZ1zLxFZ4joRAdmjKdiEMjU',
        'placeID_ChIJiey0cW5Z4joR3EK-cBauPac','placeID_ChIJr7L0oW9Z4joRjaT5aD0oCtk',
        'placeID_ChIJseUqHGtZ4joRgteF9GKSLoc'
        ]

        datac = pd.DataFrame(columns=columns)

        for place_id in request.data.get('placeIds',[]):
            column_name = f'placeID_{place_id}'
            if column_name in columns:
                datac[column_name] = []

        new_row = {key: 0 for key in datac.keys()}
        new_row['locationType_Miscellaneous'] = 1
        new_row['timeOfDay_Evening'] = 1

        for location in request.data.get('locations', []):
            matching_cols = [col for col in columns if col.endswith(location)]
            if matching_cols:
                for col in matching_cols:
                    new_row[col] = 1
            new_row_df = pd.DataFrame([new_row])
            datac = pd.concat([datac, new_row_df], ignore_index=True)

        df = pd.DataFrame(datac)
        print(df)

        print('cooooooooools', df.columns)

        model_path = finders.find('model.h5')

        model = load_model(model_path)

        prediction = model.predict(df)

        print(prediction)
        
        
         # Send a request to another microservice
        response = requests.post('http://microservice-url/api/endpoint', json=prediction)

        # Process the response from the microservice
        if response.status_code == 200:
            response_data = response.json()
            # Process the response data as needed
            print("Received response from microservice:", response_data)
        else:
            print("Error:", response.status_code)


        return Response(prediction, status=status.HTTP_200_OK)




