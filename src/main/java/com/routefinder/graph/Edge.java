package com.routefinder.graph;

import com.routefinder.model.City;

public class Edge {
    private final City targetCity;
    private final double distanceKm;
    private final int travelTimeMinutes;
    private final double cost;
    private final Long routeId;

    public Edge(City targetCity, double distanceKm, int travelTimeMinutes, double cost, Long routeId) {
        this.targetCity = targetCity;
        this.distanceKm = distanceKm;
        this.travelTimeMinutes = travelTimeMinutes;
        this.cost = cost;
        this.routeId = routeId;
    }

    public double getWeight(OptimizationCriterion criterion) {
        switch (criterion) {
            case TIME:
                return travelTimeMinutes;
            case COST:
                return cost;
            case DISTANCE:
            default:
                return distanceKm;
        }
    }

    public City getTargetCity() {
        return targetCity;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public int getTravelTimeMinutes() {
        return travelTimeMinutes;
    }

    public double getCost() {
        return cost;
    }

    public Long getRouteId() {
        return routeId;
    }

    public enum OptimizationCriterion {
        DISTANCE, TIME, COST
    }
}
