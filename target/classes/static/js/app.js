/**
 * Smart Route Finder - Interactive Dijkstra Shortest Path Visualizer
 */

class SmartRouteFinderApp {
    constructor() {
        this.cities = [];
        this.routes = [];
        this.stepsTrace = [];
        this.currentStepIdx = 0;
        this.isPlaying = false;
        this.animationTimer = null;
        this.speed = 1.0;
        this.isApiConnected = false;
        this.activePathResult = null;
        this.selectedCriterion = 'DISTANCE';

        this.initElements();
        this.initEventListeners();
        this.checkApiAndLoadData();
    }

    initElements() {
        // Form & selects
        this.sourceSelect = document.getElementById('sourceCitySelect');
        this.destSelect = document.getElementById('destCitySelect');
        this.pathfinderForm = document.getElementById('pathfinderForm');
        this.radioCards = document.querySelectorAll('.radio-card');
        this.apiStatusBadge = document.getElementById('apiStatusBadge');
        this.apiStatusText = document.getElementById('apiStatusText');

        // Playback controls
        this.playBtn = document.getElementById('playBtn');
        this.stepBtn = document.getElementById('stepBtn');
        this.resetAnimBtn = document.getElementById('resetAnimBtn');
        this.speedRange = document.getElementById('speedRange');
        this.speedVal = document.getElementById('speedVal');
        this.stepCounterText = document.getElementById('stepCounterText');
        this.progressBarFill = document.getElementById('progressBarFill');

        // Results Card
        this.resultsCard = document.getElementById('resultsCard');
        this.resDistance = document.getElementById('resDistance');
        this.resTime = document.getElementById('resTime');
        this.resCost = document.getElementById('resCost');
        this.resExecTime = document.getElementById('resExecTime');
        this.pathSequenceChips = document.getElementById('pathSequenceChips');

        // SVG Canvas
        this.graphSvg = document.getElementById('graphSvg');
        this.edgesGroup = document.getElementById('edgesGroup');
        this.nodesGroup = document.getElementById('nodesGroup');
        this.stepOverlayToast = document.getElementById('stepOverlayToast');
        this.stepDescText = document.getElementById('stepDescText');

        // Inspectors
        this.pqVisualizerList = document.getElementById('pqVisualizerList');
        this.pqSizeBadge = document.getElementById('pqSizeBadge');
        this.distanceTableBody = document.getElementById('distanceTableBody');

        // Modals
        this.addCityModal = document.getElementById('addCityModal');
        this.addRouteModal = document.getElementById('addRouteModal');
        this.seedDataBtn = document.getElementById('seedDataBtn');
    }

    initEventListeners() {
        // Metric radio buttons
        this.radioCards.forEach(card => {
            card.addEventListener('click', () => {
                this.radioCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const radio = card.querySelector('input[type="radio"]');
                radio.checked = true;
                this.selectedCriterion = radio.value;
                this.renderGraph();
            });
        });

        // Pathfinder form submit
        this.pathfinderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateRoute();
        });

        // Playback controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.stepBtn.addEventListener('click', () => this.stepForward());
        this.resetAnimBtn.addEventListener('click', () => this.resetAnimation());
        
        this.speedRange.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            this.speedVal.textContent = `${this.speed.toFixed(1)}x`;
            if (this.isPlaying) {
                this.pause();
                this.play();
            }
        });

        // Seed data button
        this.seedDataBtn.addEventListener('click', () => this.seedData());

        // Modals opening/closing
        document.getElementById('addCityModalBtn').addEventListener('click', () => this.openModal(this.addCityModal));
        document.getElementById('closeCityModalBtn').addEventListener('click', () => this.closeModal(this.addCityModal));
        document.getElementById('cancelCityModalBtn').addEventListener('click', () => this.closeModal(this.addCityModal));
        
        document.getElementById('addRouteModalBtn').addEventListener('click', () => {
            this.populateRouteModalSelects();
            this.openModal(this.addRouteModal);
        });
        document.getElementById('closeRouteModalBtn').addEventListener('click', () => this.closeModal(this.addRouteModal));
        document.getElementById('cancelRouteModalBtn').addEventListener('click', () => this.closeModal(this.addRouteModal));

        // Forms inside modals
        document.getElementById('addCityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCity();
        });
        document.getElementById('addRouteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddRoute();
        });
    }

    async checkApiAndLoadData() {
        try {
            const res = await fetch('/api/cities');
            if (res.ok) {
                this.isApiConnected = true;
                this.apiStatusText.textContent = 'Spring Boot REST API Active';
                this.apiStatusBadge.className = 'status-badge online';
                await this.loadFromApi();
            } else {
                throw new Error('API offline');
            }
        } catch (e) {
            console.log('Running in Standalone Client Mode');
            this.isApiConnected = false;
            this.apiStatusText.textContent = 'Standalone Engine Mode';
            this.apiStatusBadge.className = 'status-badge';
            this.loadDefaultClientData();
        }
    }

    async loadFromApi() {
        try {
            const citiesRes = await fetch('/api/cities');
            this.cities = await citiesRes.json();
            
            const routesRes = await fetch('/api/routes');
            this.routes = await routesRes.json();

            if (this.cities.length === 0) {
                await this.seedData();
                return;
            }

            this.populateCitySelects();
            this.renderGraph();
            this.updateDistanceTableInitial();
        } catch (e) {
            console.error('Failed loading API data:', e);
        }
    }

    loadDefaultClientData() {
        // Fallback local dataset
        this.cities = [
            { id: 1, name: "New York", code: "NYC", xposition: 18.0, yposition: 32.0 },
            { id: 2, name: "Boston", code: "BOS", xposition: 28.0, yposition: 20.0 },
            { id: 3, name: "Chicago", code: "CHI", xposition: 38.0, yposition: 42.0 },
            { id: 4, name: "Denver", code: "DEN", xposition: 55.0, yposition: 58.0 },
            { id: 5, name: "Seattle", code: "SEA", xposition: 72.0, yposition: 22.0 },
            { id: 6, name: "San Francisco", code: "SFO", xposition: 85.0, yposition: 48.0 },
            { id: 7, name: "Los Angeles", code: "LAX", xposition: 88.0, yposition: 75.0 },
            { id: 8, name: "Miami", code: "MIA", xposition: 32.0, yposition: 88.0 },
            { id: 9, name: "Dallas", code: "DFW", xposition: 48.0, yposition: 78.0 }
        ];

        this.routes = [
            { id: 101, sourceCity: this.cities[0], destinationCity: this.cities[1], distanceKm: 346.0, travelTimeMinutes: 240, cost: 65.0, bidirectional: true },
            { id: 102, sourceCity: this.cities[0], destinationCity: this.cities[2], distanceKm: 1270.0, travelTimeMinutes: 840, cost: 180.0, bidirectional: true },
            { id: 103, sourceCity: this.cities[0], destinationCity: this.cities[7], distanceKm: 2070.0, travelTimeMinutes: 1140, cost: 220.0, bidirectional: true },
            { id: 104, sourceCity: this.cities[1], destinationCity: this.cities[2], distanceKm: 1580.0, travelTimeMinutes: 960, cost: 195.0, bidirectional: true },
            { id: 105, sourceCity: this.cities[2], destinationCity: this.cities[3], distanceKm: 1610.0, travelTimeMinutes: 900, cost: 175.0, bidirectional: true },
            { id: 106, sourceCity: this.cities[2], destinationCity: this.cities[8], distanceKm: 1480.0, travelTimeMinutes: 870, cost: 160.0, bidirectional: true },
            { id: 107, sourceCity: this.cities[3], destinationCity: this.cities[4], distanceKm: 2100.0, travelTimeMinutes: 1100, cost: 230.0, bidirectional: true },
            { id: 108, sourceCity: this.cities[3], destinationCity: this.cities[5], distanceKm: 1520.0, travelTimeMinutes: 920, cost: 190.0, bidirectional: true },
            { id: 109, sourceCity: this.cities[3], destinationCity: this.cities[6], distanceKm: 1630.0, travelTimeMinutes: 940, cost: 210.0, bidirectional: true },
            { id: 110, sourceCity: this.cities[4], destinationCity: this.cities[5], distanceKm: 1300.0, travelTimeMinutes: 780, cost: 140.0, bidirectional: true },
            { id: 111, sourceCity: this.cities[5], destinationCity: this.cities[6], distanceKm: 615.0, travelTimeMinutes: 360, cost: 85.0, bidirectional: true },
            { id: 112, sourceCity: this.cities[8], destinationCity: this.cities[6], distanceKm: 2310.0, travelTimeMinutes: 1260, cost: 260.0, bidirectional: true },
            { id: 113, sourceCity: this.cities[8], destinationCity: this.cities[7], distanceKm: 2090.0, travelTimeMinutes: 1180, cost: 240.0, bidirectional: true },
            { id: 114, sourceCity: this.cities[2], destinationCity: this.cities[7], distanceKm: 2200.0, travelTimeMinutes: 1220, cost: 250.0, bidirectional: true }
        ];

        this.populateCitySelects();
        this.renderGraph();
        this.updateDistanceTableInitial();
    }

    populateCitySelects() {
        this.sourceSelect.innerHTML = '<option value="">Select origin city...</option>';
        this.destSelect.innerHTML = '<option value="">Select destination city...</option>';

        this.cities.forEach(city => {
            const opt1 = document.createElement('option');
            opt1.value = city.id;
            opt1.textContent = `${city.name} (${city.code})`;
            this.sourceSelect.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = city.id;
            opt2.textContent = `${city.name} (${city.code})`;
            this.destSelect.appendChild(opt2);
        });

        if (this.cities.length >= 2) {
            this.sourceSelect.selectedIndex = 1;
            this.destSelect.selectedIndex = 6; // NYC -> SFO default
        }
    }

    populateRouteModalSelects() {
        const sSel = document.getElementById('routeSourceSelect');
        const dSel = document.getElementById('routeDestSelect');
        sSel.innerHTML = '';
        dSel.innerHTML = '';

        this.cities.forEach(c => {
            sSel.appendChild(new Option(`${c.name} (${c.code})`, c.id));
            dSel.appendChild(new Option(`${c.name} (${c.code})`, c.id));
        });
        if (this.cities.length >= 2) {
            dSel.selectedIndex = 1;
        }
    }

    renderGraph() {
        this.edgesGroup.innerHTML = '';
        this.nodesGroup.innerHTML = '';

        const rect = this.graphSvg.getBoundingClientRect();
        const width = rect.width || 800;
        const height = rect.height || 500;

        // Render Routes (Edges)
        this.routes.forEach(route => {
            const src = this.cities.find(c => c.id === route.sourceCity.id);
            const dst = this.cities.find(c => c.id === route.destinationCity.id);
            if (!src || !dst) return;

            const x1 = (src.xposition / 100) * width;
            const y1 = (src.yposition / 100) * height;
            const x2 = (dst.xposition / 100) * width;
            const y2 = (dst.yposition / 100) * height;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("class", "edge");
            line.setAttribute("id", `edge-${route.id}`);
            this.edgesGroup.appendChild(line);

            // Edge Label (weight based on metric)
            let metricText = '';
            if (this.selectedCriterion === 'TIME') metricText = `${route.travelTimeMinutes}m`;
            else if (this.selectedCriterion === 'COST') metricText = `$${route.cost.toFixed(0)}`;
            else metricText = `${route.distanceKm.toFixed(0)}km`;

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", (x1 + x2) / 2);
            text.setAttribute("y", (y1 + y2) / 2 - 6);
            text.setAttribute("class", "edge-label");
            text.textContent = metricText;
            this.edgesGroup.appendChild(text);
        });

        // Render Cities (Nodes)
        this.cities.forEach(city => {
            const cx = (city.xposition / 100) * width;
            const cy = (city.yposition / 100) * height;

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("class", "node-group");
            g.setAttribute("id", `node-group-${city.id}`);

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", cx);
            circle.setAttribute("cy", cy);
            circle.setAttribute("r", 20);
            circle.setAttribute("class", "node-circle");
            circle.setAttribute("id", `node-${city.id}`);

            const codeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            codeText.setAttribute("x", cx);
            codeText.setAttribute("y", cy + 4);
            codeText.setAttribute("class", "node-code");
            codeText.textContent = city.code;

            const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            labelText.setAttribute("x", cx);
            labelText.setAttribute("y", cy - 25);
            labelText.setAttribute("class", "node-label");
            labelText.textContent = city.name;

            g.appendChild(circle);
            g.appendChild(codeText);
            g.appendChild(labelText);
            this.nodesGroup.appendChild(g);
        });
    }

    async calculateRoute() {
        const sourceId = parseInt(this.sourceSelect.value);
        const destId = parseInt(this.destSelect.value);

        if (!sourceId || !destId) {
            alert('Please select origin and destination cities');
            return;
        }

        if (sourceId === destId) {
            alert('Origin and Destination cities must be different');
            return;
        }

        this.resetAnimation();

        if (this.isApiConnected) {
            try {
                const url = `/api/routes/shortest-path?sourceId=${sourceId}&destinationId=${destId}&criterion=${this.selectedCriterion}`;
                const res = await fetch(url);
                this.activePathResult = await res.json();
            } catch (e) {
                console.error('API Error, falling back to local Dijkstra engine', e);
                this.activePathResult = this.runLocalDijkstra(sourceId, destId, this.selectedCriterion);
            }
        } else {
            this.activePathResult = this.runLocalDijkstra(sourceId, destId, this.selectedCriterion);
        }

        if (!this.activePathResult || !this.activePathResult.pathFound) {
            alert('No valid route exists between the selected cities.');
            return;
        }

        this.stepsTrace = this.activePathResult.steps || [];
        this.currentStepIdx = 0;
        this.displaySummaryMetrics(this.activePathResult);
        this.play();
    }

    runLocalDijkstra(sourceId, destId, criterion) {
        const startTime = performance.now();
        const graph = new Map();

        this.cities.forEach(c => graph.set(c.id, []));
        this.routes.forEach(r => {
            let weight = r.distanceKm;
            if (criterion === 'TIME') weight = r.travelTimeMinutes;
            if (criterion === 'COST') weight = r.cost;

            graph.get(r.sourceCity.id).push({ targetId: r.destinationCity.id, weight, routeId: r.id, route: r });
            if (r.bidirectional) {
                graph.get(r.destinationCity.id).push({ targetId: r.sourceCity.id, weight, routeId: r.id, route: r });
            }
        });

        const distances = {};
        const previousCity = {};
        const previousRoute = {};
        const visited = new Set();
        const steps = [];

        this.cities.forEach(c => distances[c.id] = Infinity);
        distances[sourceId] = 0;

        // Min-Heap / Priority Queue simulated array
        const pq = [{ cityId: sourceId, metricValue: 0 }];
        let stepCount = 0;

        const getCityObj = id => this.cities.find(c => c.id === id);

        const formatVal = val => val === Infinity ? '∞' : (criterion==='TIME'?`${val}m`:criterion==='COST'?`$${val}`:`${val}km`);

        const makeStep = (action, currId, nbrId, currVal, weight, newVal, desc) => {
            pq.sort((a, b) => a.metricValue - b.metricValue);
            const pqSnap = pq.map(i => ({ cityId: i.cityId, cityName: getCityObj(i.cityId).name, metricValue: i.metricValue }));
            return {
                stepNumber: ++stepCount,
                action,
                currentCityId: currId,
                currentCityName: currId ? getCityObj(currId).name : null,
                neighborCityId: nbrId,
                neighborCityName: nbrId ? getCityObj(nbrId).name : null,
                currentMetricValue: currVal,
                edgeWeight: weight,
                newCalculatedMetric: newVal,
                description: desc,
                priorityQueueState: pqSnap,
                distancesSnapshot: { ...distances }
            };
        };

        steps.push(makeStep('INITIALIZE', sourceId, null, 0, 0, 0, `Initialized Dijkstra source at ${getCityObj(sourceId).name}`));

        let targetReached = false;

        while (pq.length > 0) {
            pq.sort((a, b) => a.metricValue - b.metricValue);
            const current = pq.shift();
            const currId = current.cityId;

            if (visited.has(currId)) continue;
            visited.add(currId);

            steps.push(makeStep('EXTRACT_MIN', currId, null, current.metricValue, 0, current.metricValue, 
                `Extracted node with min distance: ${getCityObj(currId).name} (${formatVal(current.metricValue)})`));

            if (currId === destId) {
                targetReached = true;
                steps.push(makeStep('TARGET_REACHED', currId, null, current.metricValue, 0, current.metricValue,
                    `Destination ${getCityObj(currId).name} reached!`));
                break;
            }

            const neighbors = graph.get(currId) || [];
            neighbors.forEach(edge => {
                const nbrId = edge.targetId;
                if (visited.has(nbrId)) return;

                const newDist = current.metricValue + edge.weight;
                if (newDist < distances[nbrId]) {
                    distances[nbrId] = newDist;
                    previousCity[nbrId] = currId;
                    previousRoute[nbrId] = edge.routeId;
                    pq.push({ cityId: nbrId, metricValue: newDist });

                    steps.push(makeStep('EDGE_RELAXED', currId, nbrId, current.metricValue, edge.weight, newDist,
                        `Relaxed edge to ${getCityObj(nbrId).name}. Updated distance: ${formatVal(newDist)}`));
                } else {
                    steps.push(makeStep('EDGE_EXAMINED', currId, nbrId, current.metricValue, edge.weight, newDist,
                        `Examined edge to ${getCityObj(nbrId).name}. Existing distance is shorter.`));
                }
            });
        }

        const endTime = performance.now();

        if (!targetReached) {
            return { pathFound: false, steps, executionTimeMs: Math.round(endTime - startTime) };
        }

        const path = [];
        const routeIds = [];
        let curr = destId;
        while (curr !== undefined) {
            path.unshift(getCityObj(curr));
            if (previousRoute[curr]) routeIds.unshift(previousRoute[curr]);
            curr = previousCity[curr];
        }

        let totalDist = 0, totalTime = 0, totalCost = 0;
        routeIds.forEach(rId => {
            const r = this.routes.find(rt => rt.id === rId);
            if (r) {
                totalDist += r.distanceKm;
                totalTime += r.travelTimeMinutes;
                totalCost += r.cost;
            }
        });

        return {
            pathFound: true,
            path,
            routeIds,
            totalDistanceKm: totalDist,
            totalTravelTimeMinutes: totalTime,
            totalCost,
            criterion,
            executionTimeMs: Math.round(endTime - startTime),
            steps
        };
    }

    displaySummaryMetrics(result) {
        this.resDistance.textContent = `${result.totalDistanceKm.toFixed(1)} km`;
        this.resTime.textContent = `${result.totalTravelTimeMinutes} min`;
        this.resCost.textContent = `$${result.totalCost.toFixed(2)}`;
        this.resExecTime.textContent = `${result.executionTimeMs} ms`;

        this.pathSequenceChips.innerHTML = '';
        result.path.forEach((city, idx) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = `${city.name}`;
            this.pathSequenceChips.appendChild(chip);
            if (idx < result.path.length - 1) {
                const arrow = document.createElement('span');
                arrow.innerHTML = ' &rarr; ';
                arrow.style.color = 'var(--accent)';
                this.pathSequenceChips.appendChild(arrow);
            }
        });

        this.resultsCard.style.display = 'flex';
    }

    play() {
        if (this.currentStepIdx >= this.stepsTrace.length) {
            this.currentStepIdx = 0;
        }
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        this.scheduleNextStep();
    }

    pause() {
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (this.animationTimer) clearTimeout(this.animationTimer);
    }

    togglePlay() {
        if (this.stepsTrace.length === 0) return;
        if (this.isPlaying) this.pause();
        else this.play();
    }

    scheduleNextStep() {
        if (!this.isPlaying) return;
        if (this.currentStepIdx >= this.stepsTrace.length) {
            this.pause();
            this.highlightFinalPath();
            return;
        }

        this.renderStep(this.stepsTrace[this.currentStepIdx]);
        this.currentStepIdx++;

        const delay = 1000 / this.speed;
        this.animationTimer = setTimeout(() => this.scheduleNextStep(), delay);
    }

    stepForward() {
        if (this.stepsTrace.length === 0) return;
        this.pause();
        if (this.currentStepIdx < this.stepsTrace.length) {
            this.renderStep(this.stepsTrace[this.currentStepIdx]);
            this.currentStepIdx++;
            if (this.currentStepIdx >= this.stepsTrace.length) {
                this.highlightFinalPath();
            }
        }
    }

    resetAnimation() {
        this.pause();
        this.currentStepIdx = 0;
        this.stepCounterText.textContent = `Step: 0 / ${this.stepsTrace.length}`;
        this.progressBarFill.style.width = '0%';
        this.stepDescText.textContent = "Visualizer ready.";

        // Clear styles
        document.querySelectorAll('circle.node-circle').forEach(c => c.className.baseVal = 'node-circle');
        document.querySelectorAll('line.edge').forEach(l => l.className.baseVal = 'edge');
        this.updateDistanceTableInitial();
        this.pqVisualizerList.innerHTML = '<div class="empty-state">Priority Queue is empty</div>';
        this.pqSizeBadge.textContent = '0 items';
    }

    renderStep(step) {
        // Step progress & text
        const total = this.stepsTrace.length;
        this.stepCounterText.textContent = `Step: ${step.stepNumber} / ${total}`;
        this.progressBarFill.style.width = `${(step.stepNumber / total) * 100}%`;
        this.stepDescText.textContent = step.description;

        // Reset circles except settled visited
        document.querySelectorAll('circle.node-circle').forEach(c => {
            if (!c.classList.contains('visited') && !c.classList.contains('shortest-path')) {
                c.className.baseVal = 'node-circle';
            }
        });

        if (step.currentCityId) {
            const currCircle = document.getElementById(`node-${step.currentCityId}`);
            if (currCircle) {
                if (step.action === 'EXTRACT_MIN') {
                    currCircle.className.baseVal = 'node-circle current';
                } else {
                    currCircle.className.baseVal = 'node-circle visited';
                }
            }
        }

        if (step.action === 'EDGE_RELAXED' && step.currentCityId && step.neighborCityId) {
            // Find edge
            const route = this.routes.find(r => 
                (r.sourceCity.id === step.currentCityId && r.destinationCity.id === step.neighborCityId) ||
                (r.destinationCity.id === step.currentCityId && r.sourceCity.id === step.neighborCityId)
            );
            if (route) {
                const line = document.getElementById(`edge-${route.id}`);
                if (line) line.className.baseVal = 'edge relaxed';
            }
        }

        // Render Priority Queue Min-Heap Chips
        this.renderPqSnapshot(step.priorityQueueState);

        // Update Distance Table
        this.renderDistanceTableSnapshot(step.distancesSnapshot, step.currentCityId);
    }

    highlightFinalPath() {
        if (!this.activePathResult || !this.activePathResult.path) return;

        // Highlight nodes along shortest path
        this.activePathResult.path.forEach(city => {
            const circle = document.getElementById(`node-${city.id}`);
            if (circle) circle.className.baseVal = 'node-circle shortest-path';
        });

        // Highlight edges along shortest path
        this.activePathResult.routeIds.forEach(routeId => {
            const line = document.getElementById(`edge-${routeId}`);
            if (line) line.className.baseVal = 'edge shortest-path';
        });

        this.stepDescText.textContent = "⭐ Shortest Path Algorithm Complete! Optimal route highlighted in green.";
    }

    renderPqSnapshot(pqState) {
        this.pqVisualizerList.innerHTML = '';
        if (!pqState || pqState.length === 0) {
            this.pqVisualizerList.innerHTML = '<div class="empty-state">Priority Queue is empty</div>';
            this.pqSizeBadge.textContent = '0 items';
            return;
        }

        this.pqSizeBadge.textContent = `${pqState.length} items`;
        pqState.forEach(item => {
            const el = document.createElement('div');
            el.className = 'pq-item';

            let valText = item.metricValue === Infinity ? '∞' : item.metricValue.toFixed(1);
            if (this.selectedCriterion === 'TIME') valText = `${item.metricValue.toFixed(0)}m`;
            if (this.selectedCriterion === 'COST') valText = `$${item.metricValue.toFixed(0)}`;

            el.innerHTML = `
                <span>${item.cityName}</span>
                <span class="pq-item-val">${valText}</span>
            `;
            this.pqVisualizerList.appendChild(el);
        });
    }

    updateDistanceTableInitial() {
        this.distanceTableBody.innerHTML = '';
        this.cities.forEach(city => {
            const tr = document.createElement('tr');
            tr.id = `dist-row-${city.id}`;
            tr.innerHTML = `
                <td><strong>${city.name}</strong></td>
                <td><span class="text-muted">∞</span></td>
                <td><span class="badge badge-primary">Unvisited</span></td>
            `;
            this.distanceTableBody.appendChild(tr);
        });
    }

    renderDistanceTableSnapshot(distSnapshot, currentCityId) {
        if (!distSnapshot) return;

        this.cities.forEach(city => {
            const tr = document.getElementById(`dist-row-${city.id}`);
            if (!tr) return;

            const val = distSnapshot[city.id];
            let valStr = val === undefined || val === null || val === Infinity ? '∞' : val.toFixed(1);
            if (val !== undefined && val !== Infinity) {
                if (this.selectedCriterion === 'TIME') valStr = `${val.toFixed(0)} min`;
                if (this.selectedCriterion === 'COST') valStr = `$${val.toFixed(2)}`;
            }

            const isCurrent = city.id === currentCityId;
            tr.className = isCurrent ? 'active-row' : '';

            let statusBadge = '<span class="badge badge-primary">Unvisited</span>';
            if (isCurrent) statusBadge = '<span class="badge badge-warning">Current</span>';
            else if (val !== undefined && val !== Infinity) statusBadge = '<span class="badge badge-success">Reached</span>';

            tr.innerHTML = `
                <td><strong>${city.name}</strong></td>
                <td><span style="font-family: var(--font-mono); color: var(--accent); font-weight: 600;">${valStr}</span></td>
                <td>${statusBadge}</td>
            `;
        });
    }

    async seedData() {
        if (this.isApiConnected) {
            try {
                await fetch('/api/seed', { method: 'POST' });
                await this.loadFromApi();
                alert('Database seeded with sample cities and weighted routes!');
            } catch (e) {
                console.error(e);
            }
        } else {
            this.loadDefaultClientData();
            alert('Reset graph network data!');
        }
    }

    async handleAddCity() {
        const name = document.getElementById('newCityName').value;
        const code = document.getElementById('newCityCode').value.toUpperCase();
        const x = parseFloat(document.getElementById('newCityX').value);
        const y = parseFloat(document.getElementById('newCityY').value);

        const newCity = { name, code, xposition: x, yposition: y };

        if (this.isApiConnected) {
            const res = await fetch('/api/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, code, xPosition: x, yPosition: y })
            });
            const saved = await res.json();
            this.cities.push(saved);
        } else {
            newCity.id = Date.now();
            this.cities.push(newCity);
        }

        this.closeModal(this.addCityModal);
        document.getElementById('addCityForm').reset();
        this.populateCitySelects();
        this.renderGraph();
        this.updateDistanceTableInitial();
    }

    async handleAddRoute() {
        const sourceId = parseInt(document.getElementById('routeSourceSelect').value);
        const destId = parseInt(document.getElementById('routeDestSelect').value);
        const dist = parseFloat(document.getElementById('routeDist').value);
        const time = parseInt(document.getElementById('routeTime').value);
        const cost = parseFloat(document.getElementById('routeCost').value);
        const bidi = document.getElementById('routeBidi').checked;

        if (sourceId === destId) {
            alert('Source and destination cannot be identical.');
            return;
        }

        const srcObj = this.cities.find(c => c.id === sourceId);
        const dstObj = this.cities.find(c => c.id === destId);

        if (this.isApiConnected) {
            const res = await fetch('/api/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceCityId: sourceId,
                    destinationCityId: destId,
                    distanceKm: dist,
                    travelTimeMinutes: time,
                    cost,
                    bidirectional: bidi
                })
            });
            const saved = await res.json();
            this.routes.push(saved);
        } else {
            const newRoute = {
                id: Date.now(),
                sourceCity: srcObj,
                destinationCity: dstObj,
                distanceKm: dist,
                travelTimeMinutes: time,
                cost,
                bidirectional: bidi
            };
            this.routes.push(newRoute);
        }

        this.closeModal(this.addRouteModal);
        document.getElementById('addRouteForm').reset();
        this.renderGraph();
    }

    openModal(modal) { modal.classList.add('active'); }
    closeModal(modal) { modal.classList.remove('active'); }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SmartRouteFinderApp();
});
