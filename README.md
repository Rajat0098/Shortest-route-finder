# Smart Route Finder 🚀

A full-stack, state-of-the-art **Smart Route Finder** application built with **Java**, **Spring Boot**, **Spring Data JPA**, **H2 / MySQL**, and an **Interactive Web Visualizer UI**.

The application models cities as **graph nodes** and routes as **weighted edges** (distance in kilometers, travel time in minutes, and fare cost in dollars). It uses **Dijkstra's Shortest Path Algorithm** with Java's `PriorityQueue` (Min-Heap) for $O((V + E) \log V)$ efficient path finding.

---

## 🌟 Key Features

1. **Graph Core & Multi-Criteria Dijkstra Algorithm**:
   - Nodes represented as `City` objects.
   - Edges represented as `Route` objects with custom weights (Distance, Travel Time, Fare Cost).
   - Java `PriorityQueue` Min-Heap node extraction.
   - Real-time step-by-step trace generation capturing PriorityQueue contents, relaxed edges, and node settlement states for visualization.

2. **Spring Boot REST API**:
   - `/api/cities` – CRUD endpoints for city graph nodes.
   - `/api/routes` – CRUD endpoints for weighted edge routes.
   - `/api/routes/shortest-path` – Compute optimal route with customizable criteria (`DISTANCE`, `TIME`, `COST`).
   - `/api/seed` – Pre-populates a rich sample network of major cities.

3. **Interactive Web Visualizer**:
   - Modern dark glassmorphic design system.
   - SVG interactive graph canvas with dynamic node/edge rendering.
   - Algorithm playback controls: Play, Pause, Step Forward, Speed slider (0.2x - 3.0x).
   - PriorityQueue Min-Heap live state inspector.
   - Distance table updates ($d(v)$ for all nodes).
   - Animated glowing neon path highlight upon completion.

---

## 🛠️ Technology Stack

- **Backend**: Java 17+, Spring Boot 3.2, Spring Data JPA, H2 Database (or MySQL).
- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphic Design System), JavaScript (ES6+), SVG Graphics.
- **Build Tool**: Apache Maven (`pom.xml`).

---

## 🚀 How to Run the Application

### Option 1: Running with Maven
Set your `JAVA_HOME` environment variable to JDK 17+ and execute:
```bash
# Windows PowerShell
$env:JAVA_HOME = "C:\Users\HP\.jdks\graalvm-jdk-17.0.8"
mvn spring-boot:run
```

### Option 2: Accessing the Application
1. Open your browser and navigate to:
   `http://localhost:8080`
2. Select an **Origin City** (e.g., *New York*) and a **Destination City** (e.g., *San Francisco*).
3. Choose your **Optimization Metric** (*Distance*, *Time*, or *Cost*).
4. Click **Find Optimal Route** and watch Dijkstra's algorithm run step-by-step!

---

## 📊 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cities` | Fetch list of all city nodes |
| `POST` | `/api/cities` | Create a new city node |
| `DELETE` | `/api/cities/{id}` | Delete a city node and its connecting routes |
| `GET` | `/api/routes` | Fetch all weighted routes |
| `POST` | `/api/routes` | Create a new weighted route edge |
| `DELETE` | `/api/routes/{id}` | Delete a route edge |
| `GET` | `/api/routes/shortest-path` | Query shortest path (`sourceId`, `destinationId`, `criterion`) |
| `POST` | `/api/seed` | Reset and seed sample graph network |
