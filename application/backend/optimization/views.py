import json
from django.shortcuts import render
from pygit2 import Object
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.http import JsonResponse
from django.conf import settings
from deap import base, creator, tools, algorithms
import random
import googlemaps
from deap import base, creator, tools, algorithms
# Create your views here.

class RouteOptimizationAPI(APIView):
    def post(self, request):
        # Your optimization algorithm logic here
        gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
        
        prediction_dict = request.data.get('prediction_dict', {})
        first_location = request.data.get('first_location')
        startLocDict = request.data.get('startLocDict', {})        
        endLocDict = request.data.get('endLocDict', {})
        # current_place_id = request.data.get('currentPlaceId')
        
        # geocode_data = gmaps.geocode(first_location)
        
        # first_loc_placeId = geocode_data[0]['place_id']        
        # print("first_loc_placeId", first_loc_placeId)
        
        # if optimization_data:
        #     optimization_data = json.loads(optimization_data)
            
        print("hiuihuhiuhihihiuhiuh", prediction_dict, first_location)        
            
        locations = list(prediction_dict.keys())
        stay_times = [int(value) for value in prediction_dict.values()]                

        global_origin = None
        for key in startLocDict:
            global_origin = key
            break
        
        global_destination = None
        for key in endLocDict:
            global_destination = key
            break

        print("global_origin", global_origin)
        print("global_destination", global_destination)
        
        # Check if first_location exists and if so, always keep it as the first location
        # if first_location:
        #     locations.remove(first_loc_placeId)
        #     locations.insert(0, first_loc_placeId)
        
        def get_distance(origin, destination):
            result = gmaps.distance_matrix(origins=f'place_id:{origin}', destinations=f'place_id:{destination}', mode='driving')
            return result['rows'][0]['elements'][0]['distance']['value']
        
        # Genetic Algorithm setup
        creator.create("FitnessSingle", base.Fitness, weights=(-2.0, 1.0))  # Minimize both distance, preference and stay time
        creator.create("Individual", list, fitness=creator.FitnessSingle)
        toolbox = base.Toolbox()
        toolbox.register("indices", random.sample, range(len(locations)), len(locations))
        toolbox.register("individual", tools.initIterate, creator.Individual, toolbox.indices)
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)
        
        # Evaluate the fitness of an individual (route)
        def evaluate(individual):
            origin = global_origin
            destination = global_destination
            total_distance = 0
            # total_preference = 0
            total_stay_time = 0
            # Calculate distance from origin to the first location
            total_distance += get_distance(origin, locations[individual[0]])

            for i in range(len(individual) - 1):
                origin_loc = locations[individual[i]]
                destination_loc = locations[individual[i + 1]]
                distance = get_distance(origin_loc, destination_loc)
                total_distance += distance

            # total_preference = sum(user_preferences[locations[i]] * val for i, val in enumerate(individual))

            # Update total_stay_time based on the stay time for each location in the route
            total_stay_time = sum(stay_times[i] for i in individual)

            # Calculate distance from the last location to the destination
            total_distance += get_distance(locations[individual[-1]], destination)

            return total_distance, -total_stay_time # Note the negative sign to maximize stay time

        toolbox.register("mate", tools.cxOrdered)
        toolbox.register("mutate", tools.mutShuffleIndexes, indpb=0.2)
        toolbox.register("select", tools.selNSGA2)
        toolbox.register("evaluate", evaluate)
        
        population_size = 10
        generations = 10

        # Create an initial population
        population = toolbox.population(n=population_size)

        # Evaluate the entire population
        fitnesses = list(map(toolbox.evaluate, population))
        for ind, fit in zip(population, fitnesses):
            ind.fitness.values = fit

        # Crossover and mutate the population
        algorithms.eaMuPlusLambda(population, toolbox, mu=population_size, lambda_=2 * population_size,
                                  cxpb=0.4, mutpb=0.2, ngen=generations, stats=None, halloffame=None)
        
        # Select the best individual from the final population
        best_individual = tools.selBest(population, 1)[0]

        # Print the best individual's route and total distance
        print("Best Individual:")
        print("Total Distance:", best_individual.fitness.values[0])
        print("Order:", best_individual)

        toolbox.register("evaluate", evaluate)
    
        print("Route Optmization successful!")
        print(best_individual)
        
        optimization_dict = {}
        
        for i in range(len(locations)):
            place_id = locations[i]
            optimized_order = best_individual[i]            
            optimization_dict[place_id] = optimized_order
        
        optimization_dict = {k: v for k, v in sorted(optimization_dict.items(), key=lambda item: item[1])}
        
        print(optimization_dict)
        
        ordered_location_keys = list(optimization_dict.keys())
        
        # Include global origin and destination in the ordered locations
        # ordered_location_keys.insert(0, global_origin)
        # ordered_location_keys.append(global_destination)
        
        # Initialize an empty dictionary to store travel times
        ordered_travel_times = {}

        # Iterate over the ordered locations to get travel times
        for i in range(len(ordered_location_keys) - 1):
            origin = ordered_location_keys[i]
            destination = ordered_location_keys[i + 1]
            travel_time_result = gmaps.distance_matrix(origins=f'place_id:{origin}', destinations=f'place_id:{destination}', mode='driving')
            travel_time = travel_time_result['rows'][0]['elements'][0]['duration']['value']
            key = f"{origin}-{destination}"  # Using a string key
            ordered_travel_times[key] = travel_time

        # Print or use ordered_travel_times as needed
        print("Travel Times According to Order:")
        print(ordered_travel_times)    
        
        response_data = {
            "optimized_order": optimization_dict,
            "ordered_travel_times": ordered_travel_times
        }
        
        print("Kkkkkkkkkkkkkkkkkkkkkkkkk", response_data)
        
        return Response( response_data, status=status.HTTP_200_OK)