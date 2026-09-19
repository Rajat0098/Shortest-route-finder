package com.routefinder.dto;

import com.routefinder.model.City;

import java.util.List;

public class PathResultDTO {
    private List<City> path;
    private List<Long> routeIds;
    private Double totalDistanceKm;
    private Integer totalTravelTimeMinutes;
    private Double totalCost;
    private String criterion;
    private Long executionTimeMs;
    private List<AlgorithmStepDTO> steps;
    private boolean pathFound;

    public PathResultDTO() {}

    public PathResultDTO(List<City> path, List<Long> routeIds, Double totalDistanceKm, 
                         Integer totalTravelTimeMinutes, Double totalCost, String criterion, 
                         Long executionTimeMs, List<AlgorithmStepDTO> steps, boolean pathFound) {
        this.path = path;
        this.routeIds = routeIds;
        this.totalDistanceKm = totalDistanceKm;
        this.totalTravelTimeMinutes = totalTravelTimeMinutes;
        this.totalCost = totalCost;
        this.criterion = criterion;
        this.executionTimeMs = executionTimeMs;
        this.steps = steps;
        this.pathFound = pathFound;
    }

    public List<City> getPath() { return path; }
    public void setPath(List<City> path) { this.path = path; }

    public List<Long> getRouteIds() { return routeIds; }
    public void setRouteIds(List<Long> routeIds) { this.routeIds = routeIds; }

    public Double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(Double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public Integer getTotalTravelTimeMinutes() { return totalTravelTimeMinutes; }
    public void setTotalTravelTimeMinutes(Integer totalTravelTimeMinutes) { this.totalTravelTimeMinutes = totalTravelTimeMinutes; }

    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }

    public String getCriterion() { return criterion; }
    public void setCriterion(String criterion) { this.criterion = criterion; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public List<AlgorithmStepDTO> getSteps() { return steps; }
    public void setSteps(List<AlgorithmStepDTO> steps) { this.steps = steps; }

    public boolean isPathFound() { return pathFound; }
    public void setPathFound(boolean pathFound) { this.pathFound = pathFound; }
}
