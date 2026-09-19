package com.routefinder.model;

import jakarta.persistence.*;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "source_city_id", nullable = false)
    private City sourceCity;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destination_city_id", nullable = false)
    private City destinationCity;

    @Column(nullable = false)
    private Double distanceKm;

    @Column(nullable = false)
    private Integer travelTimeMinutes;

    @Column(nullable = false)
    private Double cost;

    private Boolean bidirectional = true;

    public Route() {}

    public Route(City sourceCity, City destinationCity, Double distanceKm, Integer travelTimeMinutes, Double cost, Boolean bidirectional) {
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.distanceKm = distanceKm;
        this.travelTimeMinutes = travelTimeMinutes;
        this.cost = cost;
        this.bidirectional = bidirectional != null ? bidirectional : true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public City getSourceCity() {
        return sourceCity;
    }

    public void setSourceCity(City sourceCity) {
        this.sourceCity = sourceCity;
    }

    public City getDestinationCity() {
        return destinationCity;
    }

    public void setDestinationCity(City destinationCity) {
        this.destinationCity = destinationCity;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getTravelTimeMinutes() {
        return travelTimeMinutes;
    }

    public void setTravelTimeMinutes(Integer travelTimeMinutes) {
        this.travelTimeMinutes = travelTimeMinutes;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public Boolean getBidirectional() {
        return bidirectional;
    }

    public void setBidirectional(Boolean bidirectional) {
        this.bidirectional = bidirectional;
    }
}
