from django.shortcuts import render
from django.contrib.staticfiles import finders
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
import numpy as np
import requests
from keras.models import load_model
from datetime import datetime, time, timedelta

class PredictionAPI(APIView):
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
        
        locationTypeDict = {
            'locationType_Beaches and Parks': ['ChIJBfNyajlZ4joRbxOUv8Ykfl4', 'ChIJ2fnv9CxZ4joRsFXQ14mM27Q', 'ChIJiey0cW5Z4joR3EK-cBauPac'],
            'locationType_Miscellaneous': ['ChIJiZ1zLxFZ4joRAdmjKdiEMjU'],
            'locationType_Museums and Galleries': ['ChIJ4zP25CFZ4joR5oPveZLBwLA', 'ChIJC46ViHtZ4joRCya8Jp8IxcE', 'ChIJ9asnzG9Z4joRpzOYo3-ENCk', 'ChIJr7L0oW9Z4joRjaT5aD0oCtk'],
            'locationType_Religious Site': ['ChIJQ9yCmWtZ4joRNu1evW41NTo', 'ChIJ29ux5BlZ4joRqIYssICvt2w', 'ChIJZRPdHihY4joRRH3j8j-i36Y'],
            'locationType_Shopping Center': ['ChIJseUqHGtZ4joRgteF9GKSLoc', 'ChIJTXbn3s9b4joRxbASabb7l98', 'ChIJYZELmiFZ4joRKmKnrRRtj9g']
        }
        
        timeOfDayDict = {
            'timeOfDay_Evening': 'Evening',
            'timeOfDay_Morning': 'Morning',
            'timeOfDay_Night': 'Night'
        }
        
        morning_start = time(6, 0)
        morning_end = time(12, 0)
        evening_start = time(12, 0)
        evening_end = time(18, 0)
        night_start = time(18, 0)
        night_end = time(6, 0)        
                            
        datac = pd.DataFrame(columns=columns)

        for place_id in request.data.get('placeIds',[]):
            column_name = f'placeID_{place_id}'
            if column_name in columns:
                datac[column_name] = []

        for place_id in request.data.get('placeIds', []):
            new_row = {key: 0 for key in datac.keys()}
            matching_cols = [col for col in columns if col.endswith(place_id)]            
            if matching_cols:                        
                for col in matching_cols:
                    new_row[col] = 1
                
            new_row_df = pd.DataFrame([new_row])
            datac = pd.concat([datac, new_row_df], ignore_index=True)
        
        for index, row in datac.iterrows():
            for place_id in row.filter(like='placeID_').index:                
                if row[place_id] == 1:
                    form_place_id = place_id.replace('placeID_', '')                    
                    for location_type, place_ids in locationTypeDict.items():
                        if form_place_id in place_ids:
                            print('location_type:', location_type, 'place_id:', form_place_id)                            
                            datac.at[index, location_type] = 1       
        
        for index, row in datac.iterrows():
            conv_startTime = datetime.strptime(request.data.get('startTime', []), "%H:%M").time()            
            if morning_start <= conv_startTime < morning_end:                
                datac.at[index, 'timeOfDay_Morning'] = 1
            elif evening_start <= conv_startTime < evening_end:                
                datac.at[index, 'timeOfDay_Evening'] = 1
            elif night_start <= conv_startTime < night_end:                
                datac.at[index, 'timeOfDay_Night'] = 1

        df = pd.DataFrame(datac)
        print('Heres the df')
        print(df)

        print('cooooooooools', df.columns)
        # Filter columns that start with 'locationType'
        location_type_columns = df.filter(like='timeOfDay_')

        # Print column names
        print('locationType columns:', location_type_columns.columns)

        # Print values of filtered columns
        for column in location_type_columns.columns:
            print(f'Values for column {column}:')
            print(location_type_columns[column])

        model_path = finders.find('model.h5')

        model = load_model(model_path)

        df = np.asarray(df).astype('float32')
        
        prediction = model.predict(df)

        prediction = np.round(prediction)
        print(prediction)
        
        # prediction = prediction.tolist()
        # prediction.append(request.data.get('placeIds', []))
        
        prediction_dict = {}
        place_ids = request.data.get('placeIds', [])
        predictions = prediction.flatten()
        
        for i in range(len(place_ids)):
            place_id = place_ids[i]
            pred_value = predictions[i]
            pred_value = np.float64(pred_value)
            prediction_dict[place_id] = pred_value
        
        print(prediction_dict)
        

        
        optimization_data = {
            "prediction_dict": prediction_dict,
            "first_location": request.data.get('firstLocation', [])            
        }
        
        print("hhehehehehe", optimization_data)
        
        # Send a request to another microservice
        response = requests.post('http://127.0.0.1:8000/api/routeoptimize/', json=optimization_data)
        
        sorted_prediction_dict = {}
        ordered_travel_times = {}
        
        # Process the response from the microservice
        if response.status_code == 200:
            response_data = response.json()
            print("Received response from microservice:", response_data)            
            sorted_prediction_dict = {k: prediction_dict[k] for k in sorted(prediction_dict, key=lambda x: response_data.get('optimized_order', {}).get(x, x))}
            ordered_travel_times = response_data.get('ordered_travel_times')
            # Process the response data as needed
            print("Received response from microservice:", response_data)
        else:
            print("Error:", response.status_code)
                                
        
        print("pppppppppppppppppppppp", sorted_prediction_dict, ordered_travel_times)
                
        
        # # Convert start time and end time strings to datetime objects
        start_time = datetime.strptime(request.data.get('startTime', []), "%H:%M")
        end_time = datetime.strptime(request.data.get('endTime', []), "%H:%M")

        # # Step 1: Calculate Total Predicted Stay Time
        # total_predicted_stay_time = sum(sorted_prediction_dict.values())

        # # Step 2: Calculate Total Available Time
        # total_available_time = (end_time - start_time).total_seconds() / 3600  # Convert to hours        
        
        # # Step 3: Calculate Scaling Factor
        # scaling_factor = total_available_time / total_predicted_stay_time

        # # Step 4: Adjust Predicted Stay Times
        # adjusted_stay_times = {location: stay_time * scaling_factor for location, stay_time in sorted_prediction_dict.items()}

        # # Step 5: Check Adjusted Stay Times
        # for location, adjusted_stay_time in adjusted_stay_times.items():
        #     print(f"Adjusted stay time for {location}: {adjusted_stay_time:.2f} hours")

        # # Ensure that adjusted stay times fit within the start time and end time window
        # adjusted_total_stay_time = sum(adjusted_stay_times.values())
        # if adjusted_total_stay_time > total_available_time:
        #     print("Adjusted stay times exceed available time. Further adjustments may be needed.")
        # elif adjusted_total_stay_time < total_available_time:
        #     print("Adjusted stay times are within available time.")
        
        # for location, adjusted_stay_time in adjusted_stay_times.items():
        #     sorted_prediction_dict[place_id] = adjusted_stay_time
            
        exact_time_values = {}
        
        current_time = start_time
        end_time = end_time
        
        # for location, adjusted_stay_time in adjusted_stay_times.items():
        #     end_time_location = current_time + timedelta(hours=adjusted_stay_time)
        #     # exact_time_values[location] = (current_time, end_time_location)
        #     exact_time_values[location] = (current_time.strftime("%H:%M"), end_time_location.strftime("%H:%M"))
        #     current_time = end_time_location  # Update current time for the next location
        
        # Step 1: Calculate Total Predicted Stay Time
        total_predicted_stay_time = sum(sorted_prediction_dict.values()) / 60  # Convert to hours

        # Step 2: Calculate Total Travel Time
        total_travel_time = sum(ordered_travel_times.values()) / 3600 # Convert to hours

        # Step 3: Calculate Total Available Time
        total_available_time = (end_time - start_time).total_seconds() / 3600  # Convert to hours

        print("Total Predicted Stay Time:", total_predicted_stay_time)
        print("Total Travel Time:", total_travel_time)
        print("Total Available Time:", total_available_time)

        # Step 4: Calculate Scaling Factor
        scaling_factor = total_available_time / (total_predicted_stay_time + total_travel_time)
        
        # Iterate over each location and calculate exact time values
        for i, (location, stay_time) in enumerate(sorted_prediction_dict.items()):
            stay_time_hours = stay_time / 60  # Convert to hours
            # Calculate end time for stay at the current location
            end_time_stay = current_time + timedelta(hours=stay_time_hours)
            print('1current time:', current_time)
            print("2End Time Stay:", end_time_stay)
            # Check if the end time exceeds the trip end time
            if end_time_stay > end_time:
                end_time_stay = end_time  # Set end time to trip end time if it exceeds
                print('3End Time Stay:', end_time_stay)

            # Add the stay time range for the current location to the exact time values dictionary
            exact_time_values[location] = (current_time.strftime("%H:%M"), end_time_stay.strftime("%H:%M"))
            print('4Exact Time values:', exact_time_values[location])

            # If there's a next location, calculate the travel time range
            if i < len(sorted_prediction_dict) - 1:
                next_location = list(sorted_prediction_dict.keys())[i + 1]
                current_location = list(sorted_prediction_dict.keys())[i]
                travel_time_to_next_location = ordered_travel_times[f"{current_location}-{next_location}"]
                travel_time_hours = travel_time_to_next_location / 3600  # Convert to hours
                print('5Travel Time:', travel_time_hours)
                # Calculate end time for travel to the next location
                end_time_travel = end_time_stay + timedelta(hours=travel_time_hours)
                print('6End Time Travel:', end_time_travel)
                # Check if the end time for travel exceeds the trip end time
                if end_time_travel > end_time:
                    end_time_travel = end_time  # Set end time to trip end time if it exceeds
                    print('7End Time Travel:', end_time_travel)
                # current_time += timedelta(hours=stay_time + travel_time_hours)
                
                current_time = end_time_travel
                print('8Current Time:', current_time)
            else:
                # If it's the last location, no need to calculate travel time
                current_time += timedelta(hours=stay_time_hours)
                print('9Current Time:', current_time)


        # Step 5: Adjust Predicted Stay Times
        # adjusted_stay_times = {location: stay_time * scaling_factor for location, stay_time in sorted_prediction_dict.items()}

        # Step 6: Check Adjusted Stay Times
        # adjusted_total_trip_time = total_predicted_stay_time+total_travel_time
        # if adjusted_total_trip_time > total_available_time:
        #     print("Adjusted stay times exceed available time. Further adjustments may be needed.")
        # elif adjusted_total_trip_time < total_available_time:
        #     print("Adjusted stay times are within available time.")

        # # If there's a next location
        # if i < len(list(sorted_prediction_dict.keys())) - 1:
        #     next_location = list(sorted_prediction_dict.keys())[i + 1]
        #     current_location = list(sorted_prediction_dict.keys())[i]
        #     travel_time_to_next_location = ordered_travel_times[f"{current_location}-{next_location}"]
        #     end_time_location += timedelta(seconds=travel_time_to_next_location)
        
        # else:
        #     # If there isn't a next location, use the stay time to calculate the end time
        #     end_time_location = current_time + timedelta(hours=adjusted_stay_time)
        
        # exact_time_values[location] = (current_time.strftime("%H:%M"), end_time_location.strftime("%H:%M"))
        # current_time = end_time_location  # Update current time for the next location

        print ('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh', exact_time_values, request.data.get('currentPlaceId', []))    
        for location, (start_time, end_time) in exact_time_values.items():
            print(f"{location}: {start_time} - {end_time}")
        exact_time_values = "geg"
        
        display_data = {
            "predictions": exact_time_values,
            "optimized_route": response_data.get('optimized_order', []),
        }

        return Response(display_data, status=status.HTTP_200_OK)





