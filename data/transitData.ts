export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface TransitRoute {
  id: string;
  name: string;
  service: "Green Line BRT" | "Peoples Bus (Red)" | "Peoples Bus (EV)" | "Orange Line BRT";
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  baseFare: number;
  fareRule: string;
  stops: BusStop[];
  path: [number, number][];
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

export const TRANSIT_ROUTES: TransitRoute[] = [
  {
    id: "green-line",
    name: "Green Line BRT",
    service: "Green Line BRT",
    colorHex: "#047857",
    badgeBg: "bg-emerald-700",
    badgeText: "text-white",
    baseFare: 55,
    fareRule: "Standard BRT fixed distance slab (Rs. 15 to Rs. 55)",
    stops: [
      { id: "gl-1", name: "Surjani Town Terminal", lat: 25.0298, lng: 67.0654 },
      { id: "gl-2", name: "4K Chowrangi", lat: 25.0116, lng: 67.0682 },
      { id: "gl-3", name: "Do Minute Chowrangi", lat: 24.9965, lng: 67.0664 },
      { id: "gl-4", name: "Power House Chowrangi", lat: 24.9818, lng: 67.0651 },
      { id: "gl-5", name: "Nagan Chowrangi", lat: 24.9682, lng: 67.0667 },
      { id: "gl-6", name: "Sakhi Hassan", lat: 24.9546, lng: 67.0632 },
      { id: "gl-7", name: "Hyderi Market", lat: 24.9388, lng: 67.0435 },
      { id: "gl-8", name: "Board Office", lat: 24.9298, lng: 67.0345 },
      { id: "gl-9", name: "Nazimabad No. 7", lat: 24.9182, lng: 67.0312 },
      { id: "gl-10", name: "Golimar (Gurmukat)", lat: 24.8984, lng: 67.0267 },
      { id: "gl-11", name: "Lasbela", lat: 24.8872, lng: 67.0295 },
      { id: "gl-12", name: "Patel Para", lat: 24.8775, lng: 67.0335 },
      { id: "gl-13", name: "Numaish (Mazar-e-Quaid)", lat: 24.8719, lng: 67.0381 }
    ],
    path: [
      [25.0298, 67.0654],
      [25.0116, 67.0682],
      [24.9965, 67.0664],
      [24.9818, 67.0651],
      [24.9682, 67.0667],
      [24.9546, 67.0632],
      [24.9388, 67.0435],
      [24.9298, 67.0345],
      [24.9182, 67.0312],
      [24.8984, 67.0267],
      [24.8872, 67.0295],
      [24.8775, 67.0335],
      [24.8719, 67.0381]
    ]
  },
  {
    id: "pbs-r1",
    name: "Route 1 (Red Bus)",
    service: "Peoples Bus (Red)",
    colorHex: "#dc2626",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    baseFare: 80,
    fareRule: "Rs. 80 (<=15km), Rs. 120 (>15km)",
    stops: [
      { id: "r1-1", name: "Model Colony", lat: 24.8978, lng: 67.1895 },
      { id: "r1-2", name: "Malir Halt", lat: 24.8894, lng: 67.1702 },
      { id: "r1-3", name: "Star Gate", lat: 24.8841, lng: 67.1554 },
      { id: "r1-4", name: "Jinnah Airport Terminal 1", lat: 24.8821, lng: 67.1425 },
      { id: "r1-5", name: "Drigh Road Station", lat: 24.8789, lng: 67.1192 },
      { id: "r1-6", name: "Karsaz (Shahrah-e-Faisal)", lat: 24.8721, lng: 67.0876 },
      { id: "r1-7", name: "FTC (Baloch Colony)", lat: 24.8624, lng: 67.0612 },
      { id: "r1-8", name: "Metropole Hotel", lat: 24.8528, lng: 67.0298 },
      { id: "r1-9", name: "Arts Council / Sindh Assembly", lat: 24.8542, lng: 67.0195 },
      { id: "r1-10", name: "Merewether Tower", lat: 24.8485, lng: 66.9998 }
    ],
    path: [
      [24.8978, 67.1895],
      [24.8894, 67.1702],
      [24.8841, 67.1554],
      [24.8821, 67.1425],
      [24.8789, 67.1192],
      [24.8721, 67.0876],
      [24.8624, 67.0612],
      [24.8528, 67.0298],
      [24.8542, 67.0195],
      [24.8485, 66.9998]
    ]
  },
  {
    id: "pbs-ev3",
    name: "Route EV-3 (Electric Bus)",
    service: "Peoples Bus (EV)",
    colorHex: "#0284c7",
    badgeBg: "bg-sky-700",
    badgeText: "text-white",
    baseFare: 100,
    fareRule: "Flat Rs. 100 across the route",
    stops: [
      { id: "ev3-1", name: "Malir Cantt Check Post 5", lat: 24.9351, lng: 67.1852 },
      { id: "ev3-2", name: "Safoora Chowrangi", lat: 24.9312, lng: 67.1524 },
      { id: "ev3-3", name: "Mosamiyat", lat: 24.9335, lng: 67.1265 },
      { id: "ev3-4", name: "University of Karachi (Silver Jubilee)", lat: 24.9348, lng: 67.1118 },
      { id: "ev3-5", name: "NIPA Chowrangi", lat: 24.9192, lng: 67.0984 },
      { id: "ev3-6", name: "Hassan Square", lat: 24.8998, lng: 67.0754 },
      { id: "ev3-7", name: "Numaish Chowrangi", lat: 24.8719, lng: 67.0381 }
    ],
    path: [
      [24.9351, 67.1852],
      [24.9312, 67.1524],
      [24.9335, 67.1265],
      [24.9348, 67.1118],
      [24.9192, 67.0984],
      [24.8998, 67.0754],
      [24.8719, 67.0381]
    ]
  }
];

export const INITIAL_REPORTS: DelayReport[] = [
  {
    id: "rep-1",
    routeId: "green-line",
    routeName: "Green Line BRT",
    stopName: "Numaish",
    issueType: "Overcrowded",
    comment: "Station ticketing queue is moving very slow. Buses departing at full capacity.",
    timestamp: "12 mins ago"
  },
  {
    id: "rep-2",
    routeId: "pbs-r1",
    routeName: "Route 1 (Red Bus)",
    stopName: "Karsaz (Shahrah-e-Faisal)",
    issueType: "Heavy Traffic",
    comment: "Traffic backlog near Baloch Colony bridge causing ~20 min arrival delay.",
    timestamp: "24 mins ago"
  },
  {
    id: "rep-3",
    routeId: "pbs-ev3",
    routeName: "Route EV-3 (Electric Bus)",
    stopName: "NIPA Chowrangi",
    issueType: "Delay",
    comment: "Next bus estimated in 25 mins instead of 10.",
    timestamp: "45 mins ago"
  }
];

// Distance calculation using Haversine Formula (in KM)
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}