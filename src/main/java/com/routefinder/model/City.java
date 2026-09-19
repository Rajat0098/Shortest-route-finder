package com.routefinder.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cities")
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, length = 10)
    private String code;

    private Double xPosition; // 2D layout X (0-100 or canvas coordinate)
    private Double yPosition; // 2D layout Y (0-100 or canvas coordinate)

    public City() {}

    public City(String name, String code, Double xPosition, Double yPosition) {
        this.name = name;
        this.code = code;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }

    public City(Long id, String name, String code, Double xPosition, Double yPosition) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Double getXPosition() {
        return xPosition;
    }

    public void setXPosition(Double xPosition) {
        this.xPosition = xPosition;
    }

    public Double getYPosition() {
        return yPosition;
    }

    public void setYPosition(Double yPosition) {
        this.yPosition = yPosition;
    }
}
