export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface TransitRoute {
  id: string;
  name: string;
  service: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  baseFare: number;
  fareRule: string;
  stops: BusStop[];
}

export interface DelayReport {
  id: string;
  routeId: string;
  routeName: string;
  stopName: string;
  issueType: "Delay" | "Heavy Traffic" | "Bus Broken Down" | "Overcrowded" | "Station Issue";
  comment: string;
  timestamp: string;
}

export type CityId = "karachi" | "twin_cities";

export interface CityConfig {
  id: CityId;
  name: string;
  urduName: string;
  center: [number, number];
}

export const CITIES: CityConfig[] = [
  { id: "karachi", name: "Karachi", urduName: "کراچی", center: [24.8934, 67.0822] },
  { id: "twin_cities", name: "Islamabad & Rawalpindi", urduName: "اسلام آباد / راولپنڈی", center: [33.6444, 73.0679] },
];

export const TRANSIT_DATA: Record<CityId, TransitRoute[]> = {
  karachi: [
    {
      id: "green-line",
      name: "Surjani Town to Numaish",
      service: "Green Line BRT",
      colorHex: "#047857",
      badgeBg: "bg-emerald-700",
      badgeText: "text-white",
      baseFare: 55,
      fareRule: "Rs. 15 to Rs. 55 distance slab",
      stops: [
        { id: "gl-1", name: "Surjani Town Terminal", lat: 25.0345, lng: 67.0642 },
        { id: "gl-2", name: "4K Chowrangi", lat: 25.0116, lng: 67.0682 },
        { id: "gl-3", name: "Do Minute Chowrangi", lat: 24.9965, lng: 67.0664 },
        { id: "gl-4", name: "Power House Chowrangi", lat: 24.9818, lng: 67.0651 },
        { id: "gl-5", name: "UP More", lat: 24.9750, lng: 67.0659 },
        { id: "gl-6", name: "Nagan Chowrangi", lat: 24.9682, lng: 67.0667 },
        { id: "gl-7", name: "Sakhi Hassan", lat: 24.9546, lng: 67.0632 },
        { id: "gl-8", name: "Hyderi", lat: 24.9388, lng: 67.0435 },
        { id: "gl-9", name: "Board Office", lat: 24.9298, lng: 67.0345 },
        { id: "gl-10", name: "Nazimabad No. 1", lat: 24.9182, lng: 67.0312 },
        { id: "gl-11", name: "Lasbela Chowk", lat: 24.8872, lng: 67.0295 },
        { id: "gl-12", name: "Patel Para (Guru Mandir)", lat: 24.8775, lng: 67.0335 },
        { id: "gl-13", name: "Numaish Chowrangi", lat: 24.8719, lng: 67.0381 }
      ]
    },
    {
      id: "pbs-r1",
      name: "Route 1 (Model Colony to Dockyard)",
      service: "Peoples Bus (Red)",
      colorHex: "#dc2626",
      badgeBg: "bg-red-600",
      badgeText: "text-white",
      baseFare: 80,
      fareRule: "Rs. 80 (<=15km), Rs. 120 (>15km)",
      stops: [
        { id: "r1-1", name: "Model Colony", lat: 24.8978, lng: 67.1895 },
        { id: "r1-2", name: "Malir Halt", lat: 24.8894, lng: 67.1702 },
        { id: "r1-3", name: "Colony Gate", lat: 24.8860, lng: 67.1620 },
        { id: "r1-4", name: "Jinnah Airport Terminal 1", lat: 24.8821, lng: 67.1425 },
        { id: "r1-5", name: "Drigh Road Station", lat: 24.8789, lng: 67.1192 },
        { id: "r1-6", name: "PAF Base Faisal", lat: 24.8750, lng: 67.1050 },
        { id: "r1-7", name: "Karsaz (Shahrah-e-Faisal)", lat: 24.8721, lng: 67.0876 },
        { id: "r1-8", name: "Nursery", lat: 24.8680, lng: 67.0750 },
        { id: "r1-9", name: "FTC (Baloch Colony)", lat: 24.8624, lng: 67.0612 },
        { id: "r1-10", name: "Metropole Hotel", lat: 24.8528, lng: 67.0298 },
        { id: "r1-11", name: "Arts Council", lat: 24.8542, lng: 67.0195 },
        { id: "r1-12", name: "Merewether Tower", lat: 24.8485, lng: 66.9998 },
        { id: "r1-13", name: "Dockyard", lat: 24.8420, lng: 66.9850 }
      ]
    },
    {
      id: "pbs-r2",
      name: "Route 2 (North Karachi to Indus Hospital)",
      service: "Peoples Bus (Red)",
      colorHex: "#dc2626",
      badgeBg: "bg-red-600",
      badgeText: "text-white",
      baseFare: 80,
      fareRule: "Rs. 80 (<=15km), Rs. 120 (>15km)",
      stops: [
        { id: "r2-1", name: "North Karachi Sector 5", lat: 25.0020, lng: 67.0710 },
        { id: "r2-2", name: "Nagan Chowrangi", lat: 24.9682, lng: 67.0667 },
        { id: "r2-3", name: "Sohrab Goth", lat: 24.9450, lng: 67.0870 },
        { id: "r2-4", name: "NIPA Chowrangi", lat: 24.9192, lng: 67.0984 },
        { id: "r2-5", name: "Johar Mor", lat: 24.9150, lng: 67.1100 },
        { id: "r2-6", name: "Drigh Road Station", lat: 24.8789, lng: 67.1192 },
        { id: "r2-7", name: "Shah Faisal Colony", lat: 24.8700, lng: 67.1400 },
        { id: "r2-8", name: "Singer Chowrangi", lat: 24.8450, lng: 67.1350 },
        { id: "r2-9", name: "Indus Hospital Korangi", lat: 24.8250, lng: 67.1210 }
      ]
    },
    {
      id: "pbs-ev3",
      name: "EV-3 (Malir Cantt to Numaish)",
      service: "Peoples Bus (EV)",
      colorHex: "#0284c7",
      badgeBg: "bg-sky-700",
      badgeText: "text-white",
      baseFare: 100,
      fareRule: "Flat Rs. 100",
      stops: [
        { id: "ev3-1", name: "Malir Cantt Check Post 5", lat: 24.9351, lng: 67.1852 },
        { id: "ev3-2", name: "Safoora Chowrangi", lat: 24.9312, lng: 67.1524 },
        { id: "ev3-3", name: "Mausamiyat", lat: 24.9335, lng: 67.1265 },
        { id: "ev3-4", name: "University of Karachi (Silver Jubilee)", lat: 24.9348, lng: 67.1118 },
        { id: "ev3-5", name: "NIPA Chowrangi", lat: 24.9192, lng: 67.0984 },
        { id: "ev3-6", name: "Johar Mor", lat: 24.9150, lng: 67.1100 },
        { id: "ev3-7", name: "Millennium Mall", lat: 24.9050, lng: 67.1000 },
        { id: "ev3-8", name: "National Stadium", lat: 24.8950, lng: 67.0850 },
        { id: "ev3-9", name: "Aga Khan Hospital", lat: 24.8900, lng: 67.0750 },
        { id: "ev3-10", name: "Jail Chowrangi", lat: 24.8820, lng: 67.0650 },
        { id: "ev3-11", name: "Numaish Chowrangi", lat: 24.8715, lng: 67.0385 }
      ]
    }
  ],
  twin_cities: [
    {
      id: "isb-red",
      name: "Rawalpindi - Islamabad Metrobus",
      service: "Red Line BRT",
      colorHex: "#dc2626",
      badgeBg: "bg-red-600",
      badgeText: "text-white",
      baseFare: 30,
      fareRule: "Flat Rs. 30",
      stops: [
        { id: "ir-1", name: "Saddar", lat: 33.5939, lng: 73.0538 },
        { id: "ir-2", name: "Liaquat Bagh", lat: 33.6050, lng: 73.0640 },
        { id: "ir-3", name: "Committee Chowk", lat: 33.6120, lng: 73.0670 },
        { id: "ir-4", name: "Chandni Chowk", lat: 33.6300, lng: 73.0730 },
        { id: "ir-5", name: "Sixth Road", lat: 33.6420, lng: 73.0780 },
        { id: "ir-6", name: "Faizabad", lat: 33.6610, lng: 73.0800 },
        { id: "ir-7", name: "IJP", lat: 33.6650, lng: 73.0700 },
        { id: "ir-8", name: "Faiz Ahmed Faiz", lat: 33.6750, lng: 73.0550 },
        { id: "ir-9", name: "Peshawar Morr", lat: 33.6900, lng: 73.0450 },
        { id: "ir-10", name: "PIMS", lat: 33.7050, lng: 73.0500 },
        { id: "ir-11", name: "7th Avenue", lat: 33.7120, lng: 73.0650 },
        { id: "ir-12", name: "Parade Ground", lat: 33.7190, lng: 73.0850 },
        { id: "ir-13", name: "Pak Secretariat", lat: 33.7310, lng: 73.0950 }
      ]
    },
    {
      id: "isb-orange",
      name: "Airport Route",
      service: "Orange Line",
      colorHex: "#ea580c",
      badgeBg: "bg-orange-600",
      badgeText: "text-white",
      baseFare: 50,
      fareRule: "Flat Rs. 50",
      stops: [
        { id: "io-1", name: "Peshawar Morr", lat: 33.6900, lng: 73.0450 },
        { id: "io-2", name: "G-10 Station", lat: 33.6700, lng: 73.0150 },
        { id: "io-3", name: "NUST", lat: 33.6450, lng: 72.9900 },
        { id: "io-4", name: "G-13", lat: 33.6350, lng: 72.9750 },
        { id: "io-5", name: "N-5 Interchange", lat: 33.6150, lng: 72.9250 },
        { id: "io-6", name: "Islamabad International Airport", lat: 33.5550, lng: 72.8250 }
      ]
    }
  ]
};

export const INITIAL_REPORTS: DelayReport[] = [];

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export interface GraphNode {
  stop: BusStop;
  route: TransitRoute;
  uniqueId: string;
}

export interface RouteLeg {
  type: "RIDE" | "WALK";
  route?: TransitRoute;
  startStop: BusStop;
  endStop: BusStop;
  distanceKm: number;
  timeMins: number;
  stopsPassed?: number;
  fare?: number;
}

export function findFastestRoute(
  origin: BusStop,
  destination: BusStop,
  cityRoutes: TransitRoute[]
): { legs: RouteLeg[]; totalTime: number; totalFare: number; totalDistance: number } | null {
  
  const nodes: GraphNode[] = [];
  const adjacencyList = new Map<string, { target: string; time: number; type: "RIDE" | "WALK"; dist: number }[]>();

  cityRoutes.forEach((route) => {
    for (let i = 0; i < route.stops.length; i++) {
      const stop = route.stops[i];
      const uniqueId = `${route.id}-${stop.id}`;
      nodes.push({ stop, route, uniqueId });
      adjacencyList.set(uniqueId, []);

      if (i < route.stops.length - 1) {
        const nextStop = route.stops[i + 1];
        const dist = getDistanceKm(stop.lat, stop.lng, nextStop.lat, nextStop.lng);
        const speed = route.service.includes("BRT") || route.service.includes("Line") ? 35 : 22;
        const time = (dist / speed) * 60;
        adjacencyList.get(uniqueId)!.push({ target: `${route.id}-${nextStop.id}`, time, type: "RIDE", dist });
      }

      if (i > 0) {
        const prevStop = route.stops[i - 1];
        const dist = getDistanceKm(stop.lat, stop.lng, prevStop.lat, prevStop.lng);
        const speed = route.service.includes("BRT") || route.service.includes("Line") ? 35 : 22;
        const time = (dist / speed) * 60;
        adjacencyList.get(uniqueId)!.push({ target: `${route.id}-${prevStop.id}`, time, type: "RIDE", dist });
      }
    }
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j && nodes[i].route.id !== nodes[j].route.id) {
        const dist = getDistanceKm(nodes[i].stop.lat, nodes[i].stop.lng, nodes[j].stop.lat, nodes[j].stop.lng);
        if (dist <= 0.85) {
          const walkTime = (dist / 4.5) * 60 + 6;
          adjacencyList.get(nodes[i].uniqueId)!.push({ target: nodes[j].uniqueId, time: walkTime, type: "WALK", dist });
        }
      }
    }
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, { node: string; type: "RIDE" | "WALK"; dist: number } | null>();
  const unvisited = new Set<string>();

  nodes.forEach((n) => {
    distances.set(n.uniqueId, Infinity);
    previous.set(n.uniqueId, null);
    unvisited.add(n.uniqueId);
  });

  const startNodes = nodes.filter((n) => n.stop.name === origin.name);
  const endNodes = nodes.filter((n) => n.stop.name === destination.name);

  if (startNodes.length === 0 || endNodes.length === 0) return null;

  startNodes.forEach((n) => distances.set(n.uniqueId, 0));

  while (unvisited.size > 0) {
    let currNodeId: string | null = null;
    let minDistance = Infinity;
    unvisited.forEach((id) => {
      if (distances.get(id)! < minDistance) {
        minDistance = distances.get(id)!;
        currNodeId = id;
      }
    });

    if (currNodeId === null || minDistance === Infinity) break;
    unvisited.delete(currNodeId);

    if (endNodes.some((n) => n.uniqueId === currNodeId)) break;

    const neighbors = adjacencyList.get(currNodeId) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.target)) continue;
      const newDist = distances.get(currNodeId)! + edge.time;
      if (newDist < distances.get(edge.target)!) {
        distances.set(edge.target, newDist);
        previous.set(edge.target, { node: currNodeId, type: edge.type, dist: edge.dist });
      }
    }
  }

  let bestEndNode = endNodes[0].uniqueId;
  endNodes.forEach((n) => {
    if (distances.get(n.uniqueId)! < distances.get(bestEndNode)!) {
      bestEndNode = n.uniqueId;
    }
  });

  if (distances.get(bestEndNode) === Infinity) return null;

  const rawPath: string[] = [];
  let current: string | null = bestEndNode;
  while (current !== null) {
    rawPath.unshift(current);
    const prev = previous.get(current);
    current = prev ? prev.node : null;
  }

  const legs: RouteLeg[] = [];
  let currentLeg: RouteLeg | null = null;
  let totalFare = 0;
  let totalDistance = 0;
  let totalTime = 0;

  for (let i = 0; i < rawPath.length - 1; i++) {
    const fromNode = nodes.find((n) => n.uniqueId === rawPath[i])!;
    const toNode = nodes.find((n) => n.uniqueId === rawPath[i + 1])!;
    const transition = previous.get(toNode.uniqueId)!;
    
    if (transition.dist > 0.1) totalDistance += transition.dist;

    if (transition.type === "WALK") {
      if (transition.dist > 0.05) { 
        if (currentLeg) legs.push(currentLeg);
        const timeWalk = Math.max(2, Math.round((transition.dist / 4.5) * 60));
        legs.push({
          type: "WALK",
          startStop: fromNode.stop,
          endStop: toNode.stop,
          distanceKm: transition.dist,
          timeMins: timeWalk,
        });
        totalTime += timeWalk;
        currentLeg = null;
      }
    } else {
      if (!currentLeg || currentLeg.route?.id !== fromNode.route.id) {
        if (currentLeg) legs.push(currentLeg);
        let initialFare = fromNode.route.baseFare;
        if (fromNode.route.id === "green-line") initialFare = 40;
        totalFare += initialFare;
        const speed = fromNode.route.service.includes("BRT") || fromNode.route.service.includes("Line") ? 35 : 22;
        const timeRide = (transition.dist / speed) * 60;
        currentLeg = {
          type: "RIDE",
          route: fromNode.route,
          startStop: fromNode.stop,
          endStop: toNode.stop,
          distanceKm: transition.dist,
          timeMins: timeRide,
          stopsPassed: 1,
          fare: initialFare,
        };
        totalTime += timeRide;
      } else {
        currentLeg.endStop = toNode.stop;
        currentLeg.distanceKm += transition.dist;
        const speed = currentLeg.route?.service.includes("BRT") || currentLeg.route?.service.includes("Line") ? 35 : 22;
        const timeRide = (transition.dist / speed) * 60;
        currentLeg.timeMins += timeRide;
        totalTime += timeRide;
        currentLeg.stopsPassed = (currentLeg.stopsPassed || 1) + 1;
      }
    }
  }
  if (currentLeg) legs.push(currentLeg);

  legs.forEach((leg) => {
    if (leg.type === "RIDE" && leg.route?.service === "Peoples Bus (Red)" && leg.distanceKm > 15) {
      totalFare += 40;
      leg.fare = 120;
    }
    leg.timeMins = Math.round(leg.timeMins);
    leg.distanceKm = Math.round(leg.distanceKm * 10) / 10;
  });

  return {
    legs,
    totalTime: Math.round(totalTime),
    totalFare,
    totalDistance: Math.round(totalDistance * 10) / 10,
  };
}
