package com.routefinder.graph;

import com.routefinder.dto.AlgorithmStepDTO;
import com.routefinder.dto.PathResultDTO;
import com.routefinder.model.City;
import com.routefinder.model.Route;
import com.routefinder.repository.CityRepository;
import com.routefinder.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DijkstraService {

    private final CityRepository cityRepository;
    private final RouteRepository routeRepository;

    @Autowired
    public DijkstraService(CityRepository cityRepository, RouteRepository routeRepository) {
        this.cityRepository = cityRepository;
        this.routeRepository = routeRepository;
    }

    public PathResultDTO findShortestPath(Long sourceCityId, Long destinationCityId, Edge.OptimizationCriterion criterion) {
        long startTime = System.currentTimeMillis();

        List<City> allCities = cityRepository.findAll();
        List<Route> allRoutes = routeRepository.findAll();

        Graph graph = new Graph();
        for (City city : allCities) {
            graph.addCity(city);
        }
        for (Route route : allRoutes) {
            graph.addRoute(route);
        }

        if (!graph.containsCity(sourceCityId) || !graph.containsCity(destinationCityId)) {
            return new PathResultDTO(Collections.emptyList(), Collections.emptyList(), 0.0, 0, 0.0, 
                    criterion.name(), System.currentTimeMillis() - startTime, Collections.emptyList(), false);
        }

        Map<Long, Double> distances = new HashMap<>();
        Map<Long, Long> previousCity = new HashMap<>();
        Map<Long, Long> previousRoute = new HashMap<>();
        Set<Long> visited = new HashSet<>();
        List<AlgorithmStepDTO> stepsTrace = new ArrayList<>();

        for (City city : graph.getAllCities()) {
            distances.put(city.getId(), Double.POSITIVE_INFINITY);
        }
        distances.put(sourceCityId, 0.0);

        // PriorityQueue storing [cityId, currentDistance]
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>(Comparator.comparingDouble(NodeDistance::getMetricValue));
        pq.offer(new NodeDistance(sourceCityId, 0.0));

        int stepCounter = 0;
        City sourceCityObj = graph.getCity(sourceCityId);
        City destCityObj = graph.getCity(destinationCityId);

        // Record initial step
        stepsTrace.add(createStep(++stepCounter, "INITIALIZE", sourceCityId, sourceCityObj.getName(),
                null, null, 0.0, 0.0, 0.0,
                "Initialized Dijkstra source at " + sourceCityObj.getName() + " with 0 metric distance.",
                pq, distances, graph));

        boolean targetReached = false;

        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            Long currId = current.getCityId();

            if (visited.contains(currId)) {
                continue;
            }

            visited.add(currId);
            City currentCityObj = graph.getCity(currId);
            Double currDist = current.getMetricValue();

            stepsTrace.add(createStep(++stepCounter, "EXTRACT_MIN", currId, currentCityObj.getName(),
                    null, null, currDist, 0.0, currDist,
                    "Extracted node with min distance: " + currentCityObj.getName() + " (" + formatMetric(currDist, criterion) + ").",
                    pq, distances, graph));

            if (currId.equals(destinationCityId)) {
                targetReached = true;
                stepsTrace.add(createStep(++stepCounter, "TARGET_REACHED", currId, currentCityObj.getName(),
                        null, null, currDist, 0.0, currDist,
                        "Destination " + currentCityObj.getName() + " reached! Shortest path found.",
                        pq, distances, graph));
                break; // Dijkstra early termination for single pair shortest path
            }

            for (Edge edge : graph.getNeighbors(currId)) {
                City neighborCity = edge.getTargetCity();
                Long neighborId = neighborCity.getId();

                if (visited.contains(neighborId)) {
                    continue;
                }

                double weight = edge.getWeight(criterion);
                double newDist = currDist + weight;

                if (newDist < distances.get(neighborId)) {
                    distances.put(neighborId, newDist);
                    previousCity.put(neighborId, currId);
                    previousRoute.put(neighborId, edge.getRouteId());

                    pq.offer(new NodeDistance(neighborId, newDist));

                    stepsTrace.add(createStep(++stepCounter, "EDGE_RELAXED", currId, currentCityObj.getName(),
                            neighborId, neighborCity.getName(), currDist, weight, newDist,
                            "Relaxed edge to " + neighborCity.getName() + ". Updated distance: " + formatMetric(newDist, criterion) + ".",
                            pq, distances, graph));
                } else {
                    stepsTrace.add(createStep(++stepCounter, "EDGE_EXAMINED", currId, currentCityObj.getName(),
                            neighborId, neighborCity.getName(), currDist, weight, newDist,
                            "Examined edge to " + neighborCity.getName() + ". Existing distance (" + formatMetric(distances.get(neighborId), criterion) + ") is shorter, no update.",
                            pq, distances, graph));
                }
            }
        }

        long executionTimeMs = System.currentTimeMillis() - startTime;

        if (!targetReached && distances.get(destinationCityId) == Double.POSITIVE_INFINITY) {
            return new PathResultDTO(Collections.emptyList(), Collections.emptyList(), 0.0, 0, 0.0,
                    criterion.name(), executionTimeMs, stepsTrace, false);
        }

        // Reconstruct path
        LinkedList<City> path = new LinkedList<>();
        LinkedList<Long> routeIds = new LinkedList<>();
        Long currentId = destinationCityId;

        while (currentId != null) {
            path.addFirst(graph.getCity(currentId));
            Long routeId = previousRoute.get(currentId);
            if (routeId != null) {
                routeIds.addFirst(routeId);
            }
            currentId = previousCity.get(currentId);
        }

        // Calculate totals across path edges
        double totalDistKm = 0.0;
        int totalTimeMin = 0;
        double totalCostVal = 0.0;

        for (Long rId : routeIds) {
            Optional<Route> rOpt = routeRepository.findById(rId);
            if (rOpt.isPresent()) {
                Route r = rOpt.get();
                totalDistKm += r.getDistanceKm();
                totalTimeMin += r.getTravelTimeMinutes();
                totalCostVal += r.getCost();
            }
        }

        return new PathResultDTO(path, routeIds, totalDistKm, totalTimeMin, totalCostVal,
                criterion.name(), executionTimeMs, stepsTrace, true);
    }

    private AlgorithmStepDTO createStep(int stepNo, String action, Long currId, String currName,
                                        Long nbrId, String nbrName, Double currVal, Double weight,
                                        Double newVal, String desc, PriorityQueue<NodeDistance> pq,
                                        Map<Long, Double> distances, Graph graph) {

        List<AlgorithmStepDTO.QueueElementDTO> pqSnapshot = pq.stream()
                .sorted(Comparator.comparingDouble(NodeDistance::getMetricValue))
                .map(nd -> new AlgorithmStepDTO.QueueElementDTO(nd.getCityId(), graph.getCity(nd.getCityId()).getName(), nd.getMetricValue()))
                .collect(Collectors.toList());

        Map<Long, Double> distSnapshot = new HashMap<>(distances);

        return new AlgorithmStepDTO(stepNo, action, currId, currName, nbrId, nbrName,
                currVal, weight, newVal, desc, pqSnapshot, distSnapshot);
    }

    private String formatMetric(Double value, Edge.OptimizationCriterion criterion) {
        if (value == null || value == Double.POSITIVE_INFINITY) return "∞";
        switch (criterion) {
            case TIME:
                return String.format("%.0f min", value);
            case COST:
                return String.format("$%.2f", value);
            case DISTANCE:
            default:
                return String.format("%.1f km", value);
        }
    }

    private static class NodeDistance {
        private final Long cityId;
        private final Double metricValue;

        public NodeDistance(Long cityId, Double metricValue) {
            this.cityId = cityId;
            this.metricValue = metricValue;
        }

        public Long getCityId() { return cityId; }
        public Double getMetricValue() { return metricValue; }
    }
}
