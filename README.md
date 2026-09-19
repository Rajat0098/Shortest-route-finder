# 🚀 Smart Route Finder

> **A Full-Stack Graph-Based Route Optimization System using Java, Spring Boot, Dijkstra's Algorithm, and Interactive Visualization**

Smart Route Finder is a full-stack route optimization application that models cities as **graph nodes** and routes as **weighted edges**. It uses **Dijkstra's Shortest Path Algorithm** with Java's `PriorityQueue` (Min-Heap) to calculate optimal routes based on **distance, travel time, or fare cost**.

The application also provides an interactive algorithm visualizer that allows users to observe how Dijkstra's algorithm explores nodes, relaxes edges, updates distances, and determines the optimal path.

---

## ✨ Key Features

### 🧠 DSA & Algorithm Engine

- Implemented **Dijkstra's Shortest Path Algorithm** from scratch using Java.
- Represents cities as graph **vertices** and routes as weighted **edges**.
- Uses Java `PriorityQueue` as a **Min-Heap**.
- Supports multiple optimization criteria:
  - 📍 Distance
  - ⏱️ Travel Time
  - 💰 Fare Cost
- Performs efficient edge relaxation.
- Tracks shortest distances for all nodes.
- Generates step-by-step algorithm traces.
- Visualizes:
  - PriorityQueue state
  - Node exploration
  - Edge relaxation
  - Distance updates
  - Node settlement
  - Final shortest path

---

## 🌐 REST API

Built RESTful APIs using **Spring Boot** and **Spring Data JPA**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cities` | Retrieve all cities |
| `POST` | `/api/cities` | Create a new city |
| `DELETE` | `/api/cities/{id}` | Delete a city |
| `GET` | `/api/routes` | Retrieve all routes |
| `POST` | `/api/routes` | Create a new route |
| `DELETE` | `/api/routes/{id}` | Delete a route |
| `GET` | `/api/routes/shortest-path` | Calculate optimal route |
| `POST` | `/api/seed` | Seed sample graph data |

---

## 🎨 Interactive Web Visualizer

The project includes a modern interactive frontend with:

- 🌙 Dark glassmorphism UI
- 🗺️ Interactive SVG graph
- 🔵 Dynamic nodes and edges
- ▶️ Play / Pause controls
- ⏭️ Step-by-step algorithm execution
- ⚡ Adjustable playback speed
- 📊 Live distance table
- 🧮 PriorityQueue / Min-Heap inspector
- ✨ Animated shortest-path highlighting
- 📈 Real-time algorithm execution trace

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │      Web Browser        │
                    │ HTML + CSS + JavaScript │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Spring Boot REST API │
                    │       Controllers       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Service Layer      │
                    │ Business Logic + Dijkstra│
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌──────────────────┐      ┌──────────────────┐
          │ Graph Algorithm  │      │  JPA Repository  │
          │ Dijkstra + Heap  │      │ Data Persistence │
          └──────────────────┘      └─────────┬────────┘
                                              │
                                              ▼
                                   ┌──────────────────┐
                                   │     H2 / MySQL   │
                                   └──────────────────┘
