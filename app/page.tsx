"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  TRANSIT_ROUTES,
  INITIAL_REPORTS,
  TransitRoute,
  BusStop,
  DelayReport,
  getDistanceKm,
} from "@/data/transitData";
import {
  Bus,
  MapPin,
  AlertTriangle,
  Navigation,
  Clock,
  Send,
  X,
  Compass,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

// Dynamically import Leaflet Map (SSR: false is required for window/leaflet)
const TransitMap = dynamic(() => import("@/components/TransitMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-sm">
      Loading Karachi Map Engine...
    </div>
  ),
});

export default function KarachiTransitPage() {
  const [activeTab, setActiveTab] = useState<"plan" | "reports">("plan");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("all");
  const [userCoords, setUserCoords] = useState<[number, number] | null>([24.8719, 67.0381]); // Default Numaish
  const [selectedOrigin, setSelectedOrigin] = useState<BusStop | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BusStop | null>(null);
  const [reports, setReports] = useState<DelayReport[]>(INITIAL_REPORTS);
  
  // Modal state for submitting crowdsourced report
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportRouteId, setReportRouteId] = useState(TRANSIT_ROUTES[0].id);
  const [reportStopName, setReportStopName] = useState(TRANSIT_ROUTES[0].stops[0].name);
  const [reportIssue, setReportIssue] = useState<DelayReport["issueType"]>("Delay");
  const [reportComment, setReportComment] = useState("");

  // All stops flattened
  const allStops = useMemo(() => {
    const map = new Map<string, BusStop & { route: TransitRoute }>();
    TRANSIT_ROUTES.forEach((r) => {
      r.stops.forEach((s) => {
        if (!map.has(s.name)) {
          map.set(s.name, { ...s, route: r });
        }
      });
    });
    return Array.from(map.values());
  }, []);

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    if (selectedRouteId === "all") return TRANSIT_ROUTES;
    return TRANSIT_ROUTES.filter((r) => r.id === selectedRouteId);
  }, [selectedRouteId]);

  // Current active route object
  const activeRouteObj = useMemo(() => {
    return TRANSIT_ROUTES.find((r) => r.id === selectedRouteId) || null;
  }, [selectedRouteId]);

const nearestStop = useMemo(() => {
    if (!userCoords) return null;
    let closest: BusStop | null = null;
    let minDistance = Infinity;

    TRANSIT_ROUTES.forEach((r) => {
      r.stops.forEach((s) => {
        const d = getDistanceKm(userCoords[0], userCoords[1], s.lat, s.lng);
        if (d < minDistance) {
          minDistance = d;
          closest = s;
        }
      });
    });

    // Explicitly check for null to satisfy TypeScript's strict mode
    if (!closest) return null;

    // Use "as BusStop" so TypeScript knows it's an object, allowing the spread operator
    return { ...(closest as BusStop), distance: minDistance };
  }, [userCoords]);

    // Use "as BusStop" so TypeScript knows it's an object, allowing the spread operator
    return { ...(closest as BusStop), distance: minDistance };
  }, [userCoords]);

  // GPS auto-locate
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          alert("Could not retrieve exact location. Please select your stop manually.");
        }
      );
    }
  };

  // Fare and Route Journey Calculation
  const journeyCalculation = useMemo(() => {
    if (!selectedOrigin || !selectedDestination) return null;

    const distance = getDistanceKm(
      selectedOrigin.lat,
      selectedOrigin.lng,
      selectedDestination.lat,
      selectedDestination.lng
    );

    // Identify shared routes
    const validRoutes = TRANSIT_ROUTES.filter(
      (r) =>
        r.stops.some((s) => s.name === selectedOrigin.name) &&
        r.stops.some((s) => s.name === selectedDestination.name)
    );

    let fare = 80;
    let note = "Direct route available";

    if (validRoutes.length > 0) {
      const route = validRoutes[0];
      if (route.id === "green-line") {
        fare = distance > 10 ? 55 : 35;
        note = "Green Line BRT fixed stop rate";
      } else if (route.id === "pbs-ev3") {
        fare = 100;
        note = "Electric Bus flat rate";
      } else {
        fare = distance > 15 ? 120 : 80;
        note = "Peoples Bus distance slab";
      }
    } else {
      fare = 160; // 2 legs
      note = "Transfer required at intermediate interchange";
    }

    return {
      distance,
      fare,
      note,
      routes: validRoutes,
      approxTime: Math.round(distance * 3 + 10), // Approximate city speed with stops
    };
  }, [selectedOrigin, selectedDestination]);

  // Submit Delay Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoute = TRANSIT_ROUTES.find((r) => r.id === reportRouteId);
    if (!targetRoute) return;

    const newReport: DelayReport = {
      id: `rep-${Date.now()}`,
      routeId: reportRouteId,
      routeName: targetRoute.name,
      stopName: reportStopName,
      issueType: reportIssue,
      comment: reportComment || "Reported delay by commuter.",
      timestamp: "Just now",
    };

    setReports([newReport, ...reports]);
    setIsReportModalOpen(false);
    setReportComment("");
    setActiveTab("reports");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 md:flex-row overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full h-[55%] md:h-full md:w-[460px] bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 shadow-md">
        
        {/* Header */}
        <header className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center font-bold">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  Karachi Transit Navigator
                </h1>
                <p className="text-xs text-slate-500">Verified Routes, Fares & Live Commuter Alert</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> 2025/2026 Data
            </span>
          </div>
        </header>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 px-4 pt-2 bg-slate-50 gap-4">
          <button
            onClick={() => setActiveTab("plan")}
            className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "plan"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Route & Fare Finder
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Commuter Reports
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {reports.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {activeTab === "plan" ? (
            <>
              {/* Route Filter Dropdown */}
              <div className="bg-white border border-slate-200 p-3 rounded shadow-sm">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Filter by Transit Service
                </label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="all">All Active Routes (Green Line & Peoples Bus)</option>
                  {TRANSIT_ROUTES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.service} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location & Destination Inputs */}
              <div className="bg-white border border-slate-200 p-4 rounded shadow-sm space-y-3">
                
                {/* Origin */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div> Boarding Stop / Origin
                    </span>
                    <button
                      onClick={handleGetLocation}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 underline"
                    >
                      <Navigation className="w-3 h-3" /> Auto-Detect GPS
                    </button>
                  </div>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={selectedOrigin?.name || ""}
                    onChange={(e) => {
                      const st = allStops.find((s) => s.name === e.target.value);
                      setSelectedOrigin(st || null);
                    }}
                  >
                    <option value="">Select origin stop...</option>
                    {allStops.map((s) => (
                      <option key={`orig-${s.name}`} value={s.name}>
                        {s.name} ({s.route.service})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-red-600" /> Destination Stop
                  </span>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={selectedDestination?.name || ""}
                    onChange={(e) => {
                      const st = allStops.find((s) => s.name === e.target.value);
                      setSelectedDestination(st || null);
                    }}
                  >
                    <option value="">Select destination stop...</option>
                    {allStops.map((s) => (
                      <option key={`dest-${s.name}`} value={s.name}>
                        {s.name} ({s.route.service})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto Nearest Stop Banner */}
                {nearestStop && !selectedOrigin && (
                  <div className="bg-slate-100 border border-slate-300 p-2.5 rounded text-xs text-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-slate-900">Nearest Stop Identified:</span>
                      <span>{nearestStop.name} (~{nearestStop.distance} km away)</span>
                    </div>
                    <button
                      onClick={() => setSelectedOrigin(nearestStop)}
                      className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded font-medium hover:bg-slate-800"
                    >
                      Set as Origin
                    </button>
                  </div>
                )}
              </div>

              {/* Journey Fare Card Calculation */}
              {journeyCalculation ? (
                <div className="bg-white border-2 border-slate-900 p-4 rounded shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-500">Trip Fare Calculation</span>
                      <h3 className="text-2xl font-black text-slate-900">Rs. {journeyCalculation.fare}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 block">Est. Travel Time</span>
                      <span className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" /> ~{journeyCalculation.approxTime} mins
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 text-xs space-y-1 text-slate-600">
                    <p>
                      <strong>Total Est. Distance:</strong> {journeyCalculation.distance} km
                    </p>
                    <p>
                      <strong>Fare Logic:</strong> {journeyCalculation.note}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full mt-2 bg-slate-100 border border-slate-300 text-slate-700 text-xs py-2 rounded font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Report Delay on this Route
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white border border-slate-200 rounded text-center text-xs text-slate-500">
                  Select both an origin and destination stop above to compute direct routes and official fares.
                </div>
              )}

              {/* Available Routes List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Monitored Karachi Lines ({filteredRoutes.length})
                </h4>
                {filteredRoutes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`bg-white border rounded p-3 cursor-pointer transition-all ${
                      selectedRouteId === r.id
                        ? "border-slate-900 ring-1 ring-slate-900"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`${r.badgeBg} ${r.badgeText} text-[11px] font-bold px-2 py-0.5 rounded-sm`}>
                          {r.service}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{r.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">Base Rs. {r.baseFare}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {r.stops.length} major stops • {r.stops[0].name} to {r.stops[r.stops.length - 1].name}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Crowdsourced Reports Feed */
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Commuter Reports Feed</h4>
                  <p className="text-[11px] text-slate-500">Real-time alerts by passengers on ground</p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-slate-800 flex items-center gap-1"
                >
                  + Post Report
                </button>
              </div>

              {reports.map((rep) => (
                <div key={rep.id} className="bg-white border border-slate-200 p-3.5 rounded shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      {rep.routeName}
                    </span>
                    <span className="text-[11px] text-slate-400">{rep.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {rep.issueType}
                    </span>
                    <span className="text-slate-600 font-medium">Near: {rep.stopName}</span>
                  </div>
                  <p className="text-xs text-slate-700 pt-1 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                    "{rep.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN MAP VIEW */}
      <main className="flex-1 h-[45%] md:h-full relative z-10">
        <TransitMap
          routes={filteredRoutes}
          selectedRoute={activeRouteObj}
          userCoords={userCoords}
          nearestStop={nearestStop}
          onSelectStop={(stop, route) => {
            if (!selectedOrigin) {
              setSelectedOrigin(stop);
            } else if (!selectedDestination && selectedOrigin.name !== stop.name) {
              setSelectedDestination(stop);
            }
          }}
        />

        {/* Map Legend Overlay */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-none border border-slate-300 p-2.5 rounded shadow-sm text-[11px] space-y-1.5 z-[1000] hidden sm:block">
          <span className="font-bold text-slate-800 block text-xs border-b border-slate-200 pb-1">Route Legend</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-700 rounded"></span> Green Line BRT
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-red-600 rounded"></span> Peoples Bus (Red)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-sky-700 rounded"></span> EV Electric Bus
          </div>
        </div>
      </main>

      {/* SUBMIT REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Submit Live Bus Issue / Delay
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route</label>
                <select
                  value={reportRouteId}
                  onChange={(e) => setReportRouteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                >
                  {TRANSIT_ROUTES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.service} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stop / Location</label>
                <input
                  type="text"
                  required
                  value={reportStopName}
                  onChange={(e) => setReportStopName(e.target.value)}
                  placeholder="e.g. Numaish, Karsaz, Nagan Chowrangi"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Type</label>
                <select
                  value={reportIssue}
                  onChange={(e) => setReportIssue(e.target.value as DelayReport["issueType"])}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="Delay">Severe Delay</option>
                  <option value="Heavy Traffic">Heavy Traffic / Road Blocked</option>
                  <option value="Overcrowded">Bus Overcrowded (Cannot Board)</option>
                  <option value="Bus Broken Down">Bus Broken Down</option>
                  <option value="Station Issue">Station Ticketing Down</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details (Optional)</label>
                <textarea
                  rows={2}
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="e.g. Wait time is over 30 mins, bus didn't stop."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 text-xs py-2 rounded font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white text-xs py-2 rounded font-medium hover:bg-slate-800 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
