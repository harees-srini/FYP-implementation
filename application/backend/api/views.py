from django.conf import settings
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
import googlemaps
import random


class PredictionAPI(APIView):
    def post(self, request):
        
        gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)

        columns = [
            "timeOfDay_Evening",
            "timeOfDay_Morning",
            "timeOfDay_Night",
            "new_place_types_art_gallery,tourist_attraction,point_of_interest,establishment",
            "new_place_types_grocery_or_supermarket,food,point_of_interest,store,establishment",
            "new_place_types_grocery_or_supermarket,food,store,point_of_interest,establishment",
            "new_place_types_grocery_or_supermarket,store,food,point_of_interest,establishment",
            "new_place_types_grocery_or_supermarket,store,point_of_interest,food,establishment",
            "new_place_types_hindu_temple,place_of_worship,point_of_interest,establishment",
            "new_place_types_locality,political",
            "new_place_types_park,point_of_interest,establishment",
            "new_place_types_park,tourist_attraction,point_of_interest,establishment",
            "new_place_types_premise",
            "new_place_types_shopping_mall,lodging,shoe_store,store,point_of_interest,establishment",
            "new_place_types_shopping_mall,point_of_interest,establishment",
            "new_place_types_shopping_mall,shoe_store,lodging,point_of_interest,store,establishment",
            "new_place_types_shopping_mall,shoe_store,lodging,store,point_of_interest,establishment",
            "new_place_types_shopping_mall,shoe_store,store,lodging,point_of_interest,establishment",
            "new_place_types_tourist_attraction,museum,point_of_interest,establishment",
            "new_place_types_tourist_attraction,place_of_worship,point_of_interest,establishment",
            "new_place_types_tourist_attraction,point_of_interest,establishment",
            "randomized_stay_time",
        ]

        userPreferenceDict = {
            "shopping": [
                "shopping_mall",
                "store",
                "shoe_store",
                "grocery_or_supermarket",
            ],
            "relax": ["park"],
            "explore": ["locality", "premise", "political"],
            "sightsee": [
                "tourist_attraction",
                "museum",
                "art_gallery",
                "place_of_worship",
            ],
            "worship": ["place_of_worship"],
        }

        datac = pd.DataFrame(columns=columns)

        print("dataccolumns:", datac.columns)

        morning_start = time(6, 0)
        morning_end = time(12, 0)
        evening_start = time(12, 0)
        evening_end = time(18, 0)
        night_start = time(18, 0)
        night_end = time(6, 0)

        for place_id in request.data.get("placeIds", []):
            new_row = {key: 0 for key in datac.keys()}
            place = gmaps.place(place_id)
            if "types" in place["result"]:
                location_types = place["result"]["types"]
                for key, value in userPreferenceDict.items():
                    if request.data.get("userPreference") == key:
                        print("key:", key)
                        if any(loc_type in value for loc_type in location_types):
                            print("location_types:", location_types)
                            random_stay_time = random.uniform(101.34, (400 / 3))
                            new_row["randomized_stay_time"] = random_stay_time
                        else:
                            random_stay_time = random.uniform(45, 200)
                            new_row["randomized_stay_time"] = random_stay_time
                location_type = ",".join(location_types)
                print("location_type:", location_type)
                column_name = f"new_place_types_{location_type}"
                matching_cols = [col for col in columns if col == column_name]

                if matching_cols:
                    for col in matching_cols:
                        new_row[col] = 1
                elif not matching_cols:
                    first_location_type = location_types[0]
                    print("first_location_type:", first_location_type)
                    for col in columns:
                        col_values = col.replace("new_place_types_", "")
                        print("col_values:", col_values)
                        if first_location_type in col_values:
                            print("yes is tere")
                            new_row[col] = 1
                            break

            conv_startTime = datetime.strptime(
                request.data.get("startTime", []), "%H:%M"
            ).time()
            print("conv_startTime:", conv_startTime)
            if morning_start <= conv_startTime < morning_end:
                print("jil")
                new_row["timeOfDay_Morning"] = 1
            elif evening_start <= conv_startTime < evening_end:
                print("jung")
                new_row["timeOfDay_Evening"] = 1
            elif night_start <= conv_startTime < night_end:
                print("juk")
                new_row["timeOfDay_Night"] = 1

            new_row_df = pd.DataFrame([new_row])
            datac = pd.concat([datac, new_row_df], ignore_index=True)

        df = pd.DataFrame(datac)

        model_path = finders.find("model.h5")
        model = load_model(model_path)

        df = np.asarray(df).astype("float32")

        prediction = model.predict(df)
        prediction = np.round(prediction)

        prediction_dict = {}
        place_ids = request.data.get("placeIds", [])
        predictions = prediction.flatten()

        for i in range(len(place_ids)):
            place_id = place_ids[i]
            pred_value = predictions[i]
            pred_value = np.float64(pred_value)
            prediction_dict[place_id] = pred_value

        print("Prediction dictionary: ", prediction_dict)

        optimization_data = {
            "prediction_dict": prediction_dict,
            "first_location": request.data.get("firstLocation", []),
            "startLocDict": request.data.get("startLocDict", []),
            "endLocDict": request.data.get("endLocDict", []),
        }

        print("Optimization start time: ", datetime.now())
        # Send a request to another microservice
        response = requests.post(
            "http://127.0.0.1:8000/api/routeoptimize/", json=optimization_data
        )

        sorted_prediction_dict = {}
        ordered_travel_times = {}

        # Process the response from the microservice
        if response.status_code == 200:
            response_data = response.json()
            print("Received response from microservice:", response_data)
            sorted_prediction_dict = {
                k: prediction_dict[k]
                for k in sorted(
                    prediction_dict,
                    key=lambda x: response_data.get("optimized_order", {}).get(x, x),
                )
            }
            ordered_travel_times = response_data.get("ordered_travel_times")
            # Process the response data as needed
        else:
            print("Error:", response.status_code)

        print("Optimization end time: ", datetime.now())

        # # Convert start time and end time strings to datetime objects
        start_time = datetime.strptime(request.data.get("startTime", []), "%H:%M")
        end_time = datetime.strptime(request.data.get("endTime", []), "%H:%M")

        exact_time_values = {}

        current_time = start_time
        end_time = end_time

        # Step 1: Calculate Total Predicted Stay Time
        total_predicted_stay_time = (
            sum(sorted_prediction_dict.values()) / 60
        )  # Convert to hours

        # Step 2: Calculate Total Travel Time
        total_travel_time = (
            sum(ordered_travel_times.values()) / 3600
        )  # Convert to hours

        # Step 3: Calculate Total Available Time
        total_available_time = (
            end_time - start_time
        ).total_seconds() / 3600  # Convert to hours

        # Step 4: Calculate Scaling Factor
        scaling_factor = total_available_time / (
            total_predicted_stay_time + total_travel_time
        )

        # # Step 5: Adjust Predicted Stay Times
        adjusted_stay_times_dict = {
            location: stay_time * scaling_factor
            for location, stay_time in sorted_prediction_dict.items()
        }
        print("Adjusted Stay Times:", adjusted_stay_times_dict)

        # Iterate over each location and calculate exact time values
        for i, (location, stay_time) in enumerate(adjusted_stay_times_dict.items()):
            stay_time_hours = stay_time / 60  # Convert to hours
            # Calculate end time for stay at the current location
            end_time_stay = current_time + timedelta(hours=stay_time_hours)

            # Check if the end time exceeds the trip end time
            if end_time_stay > end_time:
                end_time_stay = end_time  # Set end time to trip end time if it exceeds
            # Add the stay time range for the current location to the exact time values dictionary
            exact_time_values[location] = (
                current_time.strftime("%H:%M"),
                end_time_stay.strftime("%H:%M"),
            )

            # If there's a next location, calculate the travel time range
            if i < len(adjusted_stay_times_dict) - 1:
                next_location = list(adjusted_stay_times_dict.keys())[i + 1]
                current_location = list(adjusted_stay_times_dict.keys())[i]
                travel_time_to_next_location = ordered_travel_times[
                    f"{current_location}-{next_location}"
                ]
                travel_time_hours = (
                    travel_time_to_next_location / 3600
                )  # Convert to hours
                # Calculate end time for travel to the next location
                end_time_travel = end_time_stay + timedelta(hours=travel_time_hours)
                # Check if the end time for travel exceeds the trip end time
                if end_time_travel > end_time:
                    end_time_travel = (
                        end_time  # Set end time to trip end time if it exceeds
                    )
                # current_time += timedelta(hours=stay_time + travel_time_hours)
                current_time = end_time_travel
            else:
                # If it's the last location, no need to calculate travel time
                current_time += timedelta(hours=stay_time_hours)

        for location, (start_time, end_time) in exact_time_values.items():
            print(f"{location}: {start_time} - {end_time}")

        display_data = {
            "predictions": exact_time_values,
            "optimized_route": response_data.get("optimized_order", []),
        }

        return Response(display_data, status=status.HTTP_200_OK)
