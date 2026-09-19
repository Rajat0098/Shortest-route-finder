package com.routefinder.dto;

import java.util.List;
import java.util.Map;

public class AlgorithmStepDTO {
    private int stepNumber;
    private String action; // e.g., EXTRACT_MIN, EDGE_EXAMINED, EDGE_RELAXED, TARGET_REACHED
    private Long currentCityId;
    private String currentCityName;
    private Long neighborCityId;
    private String neighborCityName;
    private Double currentMetricValue;
    private Double edgeWeight;
    private Double newCalculatedMetric;
    private String description;
    private List<QueueElementDTO> priorityQueueState;
    private Map<Long, Double> distancesSnapshot;

    public AlgorithmStepDTO() {}

    public AlgorithmStepDTO(int stepNumber, String action, Long currentCityId, String currentCityName, 
                            Long neighborCityId, String neighborCityName, Double currentMetricValue, 
                            Double edgeWeight, Double newCalculatedMetric, String description, 
                            List<QueueElementDTO> priorityQueueState, Map<Long, Double> distancesSnapshot) {
        this.stepNumber = stepNumber;
        this.action = action;
        this.currentCityId = currentCityId;
        this.currentCityName = currentCityName;
        this.neighborCityId = neighborCityId;
        this.neighborCityName = neighborCityName;
        this.currentMetricValue = currentMetricValue;
        this.edgeWeight = edgeWeight;
        this.newCalculatedMetric = newCalculatedMetric;
        this.description = description;
        this.priorityQueueState = priorityQueueState;
        this.distancesSnapshot = distancesSnapshot;
    }

    public static class QueueElementDTO {
        private Long cityId;
        private String cityName;
        private Double metricValue;

        public QueueElementDTO(Long cityId, String cityName, Double metricValue) {
            this.cityId = cityId;
            this.cityName = cityName;
            this.metricValue = metricValue;
        }

        public Long getCityId() { return cityId; }
        public String getCityName() { return cityName; }
        public Double getMetricValue() { return metricValue; }
    }

    // Getters and Setters
    public int getStepNumber() { return stepNumber; }
    public void setStepNumber(int stepNumber) { this.stepNumber = stepNumber; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getCurrentCityId() { return currentCityId; }
    public void setCurrentCityId(Long currentCityId) { this.currentCityId = currentCityId; }

    public String getCurrentCityName() { return currentCityName; }
    public void setCurrentCityName(String currentCityName) { this.currentCityName = currentCityName; }

    public Long getNeighborCityId() { return neighborCityId; }
    public void setNeighborCityId(Long neighborCityId) { this.neighborCityId = neighborCityId; }

    public String getNeighborCityName() { return neighborCityName; }
    public void setNeighborCityName(String neighborCityName) { this.neighborCityName = neighborCityName; }

    public Double getCurrentMetricValue() { return currentMetricValue; }
    public void setCurrentMetricValue(Double currentMetricValue) { this.currentMetricValue = currentMetricValue; }

    public Double getEdgeWeight() { return edgeWeight; }
    public void setEdgeWeight(Double edgeWeight) { this.edgeWeight = edgeWeight; }

    public Double getNewCalculatedMetric() { return newCalculatedMetric; }
    public void setNewCalculatedMetric(Double newCalculatedMetric) { this.newCalculatedMetric = newCalculatedMetric; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<QueueElementDTO> getPriorityQueueState() { return priorityQueueState; }
    public void setPriorityQueueState(List<QueueElementDTO> priorityQueueState) { this.priorityQueueState = priorityQueueState; }

    public Map<Long, Double> getDistancesSnapshot() { return distancesSnapshot; }
    public void setDistancesSnapshot(Map<Long, Double> distancesSnapshot) { this.distancesSnapshot = distancesSnapshot; }
}
