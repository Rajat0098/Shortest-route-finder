package com.routefinder.controller;

import com.routefinder.dto.PathResultDTO;
import com.routefinder.graph.DijkstraService;
import com.routefinder.graph.Edge;
import com.routefinder.model.City;
import com.routefinder.model.Route;
import com.routefinder.repository.CityRepository;
import com.routefinder.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RouteFinderController {

    private final CityRepository cityRepository;
    private final RouteRepository routeRepository;
    private final DijkstraService dijkstraService;

    @Autowired
    public RouteFinderController(CityRepository cityRepository, RouteRepository routeRepository, DijkstraService dijkstraService) {
        this.cityRepository = cityRepository;
        this.routeRepository = routeRepository;
        this.dijkstraService = dijkstraService;
    }

    // --- City Management Endpoints ---

    @GetMapping("/cities")
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @PostMapping("/cities")
    public ResponseEntity<City> createCity(@RequestBody City city) {
        if (city.getCode() == null || city.getCode().trim().isEmpty()) {
            city.setCode(city.getName().substring(0, Math.min(3, city.getName().length())).toUpperCase());
        }
        City savedCity = cityRepository.save(city);
        return ResponseEntity.ok(savedCity);
    }

    @DeleteMapping("/cities/{id}")
    @Transactional
    public ResponseEntity<Void> deleteCity(@PathVariable Long id) {
        List<Route> routesToDelete = routeRepository.findAllRoutesForCity(id);
        routeRepository.deleteAll(routesToDelete);
        cityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Route Management Endpoints ---

    @GetMapping("/routes")
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeRepository.findAll());
    }

    @PostMapping("/routes")
    public ResponseEntity<?> createRoute(@RequestBody RouteRequest request) {
        City source = cityRepository.findById(request.getSourceCityId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid source city ID: " + request.getSourceCityId()));
        City dest = cityRepository.findById(request.getDestinationCityId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid destination city ID: " + request.getDestinationCityId()));

        Route route = new Route(source, dest, request.getDistanceKm(), request.getTravelTimeMinutes(), 
                request.getCost(), request.getBidirectional());

        Route savedRoute = routeRepository.save(route);
        return ResponseEntity.ok(savedRoute);
    }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {
        routeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- Shortest Path Finder Endpoint ---

    @GetMapping("/routes/shortest-path")
    public ResponseEntity<PathResultDTO> getShortestPath(
            @RequestParam Long sourceId,
            @RequestParam Long destinationId,
            @RequestParam(defaultValue = "DISTANCE") String criterion) {

        Edge.OptimizationCriterion optCriterion;
        try {
            optCriterion = Edge.OptimizationCriterion.valueOf(criterion.toUpperCase());
        } catch (Exception e) {
            optCriterion = Edge.OptimizationCriterion.DISTANCE;
        }

        PathResultDTO result = dijkstraService.findShortestPath(sourceId, destinationId, optCriterion);
        return ResponseEntity.ok(result);
    }

    // --- Seed Sample Graph ---

    @PostMapping("/seed")
    @Transactional
    public ResponseEntity<String> seedSampleData() {
        routeRepository.deleteAll();
        cityRepository.deleteAll();

        // Sample Cities with layout coordinates (percentage x, y)
        City ny = cityRepository.save(new City("New York", "NYC", 18.0, 32.0));
        City bos = cityRepository.save(new City("Boston", "BOS", 28.0, 20.0));
        City chi = cityRepository.save(new City("Chicago", "CHI", 38.0, 42.0));
        City den = cityRepository.save(new City("Denver", "DEN", 55.0, 58.0));
        City sea = cityRepository.save(new City("Seattle", "SEA", 72.0, 22.0));
        City sf = cityRepository.save(new City("San Francisco", "SFO", 85.0, 48.0));
        City la = cityRepository.save(new City("Los Angeles", "LAX", 88.0, 75.0));
        City mia = cityRepository.save(new City("Miami", "MIA", 32.0, 88.0));
        City dal = cityRepository.save(new City("Dallas", "DFW", 48.0, 78.0));

        // Sample Routes (source, dest, distKm, travelTimeMin, cost$, bidirectional)
        List<Route> routes = Arrays.asList(
                new Route(ny, bos, 346.0, 240, 65.0, true),
                new Route(ny, chi, 1270.0, 840, 180.0, true),
                new Route(ny, mia, 2070.0, 1140, 220.0, true),
                new Route(bos, chi, 1580.0, 960, 195.0, true),
                new Route(chi, den, 1610.0, 900, 175.0, true),
                new Route(chi, dal, 1480.0, 870, 160.0, true),
                new Route(den, sea, 2100.0, 1100, 230.0, true),
                new Route(den, sf, 1520.0, 920, 190.0, true),
                new Route(den, la, 1630.0, 940, 210.0, true),
                new Route(sea, sf, 1300.0, 780, 140.0, true),
                new Route(sf, la, 615.0, 360, 85.0, true),
                new Route(dal, la, 2310.0, 1260, 260.0, true),
                new Route(dal, mia, 2090.0, 1180, 240.0, true),
                new Route(chi, mia, 2200.0, 1220, 250.0, true)
        );

        routeRepository.saveAll(routes);

        return ResponseEntity.ok("Successfully seeded 9 cities and 14 weighted routes into persistent storage!");
    }

    // Helper request DTO
    public static class RouteRequest {
        private Long sourceCityId;
        private Long destinationCityId;
        private Double distanceKm;
        private Integer travelTimeMinutes;
        private Double cost;
        private Boolean bidirectional = true;

        public Long getSourceCityId() { return sourceCityId; }
        public void setSourceCityId(Long sourceCityId) { this.sourceCityId = sourceCityId; }

        public Long getDestinationCityId() { return destinationCityId; }
        public void setDestinationCityId(Long destinationCityId) { this.destinationCityId = destinationCityId; }

        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

        public Integer getTravelTimeMinutes() { return travelTimeMinutes; }
        public void setTravelTimeMinutes(Integer travelTimeMinutes) { this.travelTimeMinutes = travelTimeMinutes; }

        public Double getCost() { return cost; }
        public void setCost(Double cost) { this.cost = cost; }

        public Boolean getBidirectional() { return bidirectional; }
        public void setBidirectional(Boolean bidirectional) { this.bidirectional = bidirectional; }
    }
}
