from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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
        locations = list(request.data.keys())
        stay_times = [int(value) for value in request.data.values()]

        global_origin = 'ChIJx7uM9MNb4joROa_u8TYN3mg'
        global_destination = 'ChIJx7uM9MNb4joROa_u8TYN3mg'
        
        def get_distance(origin, destination):
            result = gmaps.distance_matrix(origins=f'place_id:{origin}', destinations=f'place_id:{destination}', mode='driving')
            return result['rows'][0]['elements'][0]['distance']['value']
        
        # Genetic Algorithm setup
        creator.create("FitnessSingle", base.Fitness, weights=(-2.0, -1.0))  # Minimize both distance, preference and stay time
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
        
        print(optimization_dict)
        
        return Response( optimization_dict, status=status.HTTP_200_OK)