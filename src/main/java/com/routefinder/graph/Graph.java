package com.routefinder.graph;

import com.routefinder.model.City;
import com.routefinder.model.Route;

import java.util.*;

public class Graph {
    private final Map<Long, City> citiesMap = new HashMap<>();
    private final Map<Long, List<Edge>> adjacencyList = new HashMap<>();

    public void addCity(City city) {
        citiesMap.put(city.getId(), city);
        adjacencyList.putIfAbsent(city.getId(), new ArrayList<>());
    }

    public void addRoute(Route route) {
        City source = route.getSourceCity();
        City dest = route.getDestinationCity();

        addCity(source);
        addCity(dest);

        adjacencyList.get(source.getId()).add(new Edge(dest, route.getDistanceKm(), route.getTravelTimeMinutes(), route.getCost(), route.getId()));

        if (Boolean.TRUE.equals(route.getBidirectional())) {
            adjacencyList.get(dest.getId()).add(new Edge(source, route.getDistanceKm(), route.getTravelTimeMinutes(), route.getCost(), route.getId()));
        }
    }

    public City getCity(Long id) {
        return citiesMap.get(id);
    }

    public Collection<City> getAllCities() {
        return citiesMap.values();
    }

    public List<Edge> getNeighbors(Long cityId) {
        return adjacencyList.getOrDefault(cityId, Collections.emptyList());
    }

    public boolean containsCity(Long cityId) {
        return citiesMap.containsKey(cityId);
    }
}
