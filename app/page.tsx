"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  TRANSIT_ROUTES,
  INITIAL_REPORTS,
  BusStop,
  DelayReport,
  findFastestRoute,
  getDistanceKm,
} from "@/data/transitData";
import ReportModal from "@/components/ReportModal";
import {
  Bus,
  MapPin,
  Footprints,
  ArrowRightCircle,
  CheckCircle2,
  Navigation,
  AlertTriangle,
  Clock,
  Languages,
  ShieldCheck,
} from "lucide-react";

const TransitMap = dynamic(() => import("@/components/TransitMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-sm">
      Initializing Karachi Geo Engine...
    </div>
  ),
});

export default function KarachiTransitApp() {
  const [isUrdu, setIsUrdu] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"plan" | "reports">("plan");
  const [selectedOrigin, setSelectedOrigin] = useState<BusStop | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BusStop | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>([24.8719, 67.0381]);
  const [reports, setReports] = useState<DelayReport[]>(INITIAL_REPORTS);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (data.reports) setReports(data.reports);
      } catch {
        // Continue with initial reports
      }
    }
    fetchReports();
  }, []);

  const allStops = useMemo(() => {
    const map = new Map<string, BusStop>();
    TRANSIT_ROUTES.forEach((r) =>
      r.stops.forEach((s) => {
        if (!map.has(s.name)) map.set(s.name, s);
      })
    );
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

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

    if (!closest) return null;
    return { ...(closest as BusStop), distance: minDistance };
  }, [userCoords]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);

          let closest: BusStop | null = null;
          let minDistance = Infinity;
          TRANSIT_ROUTES.forEach((r) => {
            r.stops.forEach((s) => {
              const d = getDistanceKm(lat, lng, s.lat, s.lng);
              if (d < minDistance) {
                minDistance = d;
                closest = s;
              }
            });
          });
          if (closest) setSelectedOrigin(closest);
        },
        () => {
          alert("Location access denied. Please select your origin stop manually.");
        }
      );
    }
  };

  const journeyData = useMemo(() => {
    if (!selectedOrigin || !selectedDestination || selectedOrigin.name === selectedDestination.name) {
      return null;
    }
    return findFastestRoute(selectedOrigin, selectedDestination);
  }, [selectedOrigin, selectedDestination]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 md:flex-row font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR PANEL */}
      <aside className="w-full md:w-[440px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-md shrink-0 h-1/2 md:h-full">
        
        {/* Top Header */}
        <header className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center font-bold">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-tight">
                {isUrdu ? "کراچی ٹرانزٹ گائیڈ" : "Karachi Transit Guide"}
              </h1>
              <p className="text-[11px] text-slate-400">Green Line • Peoples Bus • EV Routes</p>
            </div>
          </div>
          <button
            onClick={() => setIsUrdu(!isUrdu)}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded font-medium transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            {isUrdu ? "English" : "اردو"}
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50 gap-4">
          <button
            onClick={() => setActiveTab("plan")}
            className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === "plan"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {isUrdu ? "روٹ اور کرایہ معلوم کریں" : "Find Route & Fare"}
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {isUrdu ? "لائیو مسافر الرٹس" : "Commuter Alerts"}
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {reports.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {activeTab === "plan" ? (
            <>
              {/* Origin / Destination Picker */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-3">
                {/* Origin */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      {isUrdu ? "روانگی کا مقام (بورڈنگ اسٹاپ)" : "Boarding Stop (Origin)"}
                    </label>
                    <button
                      onClick={handleGetLocation}
                      className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 underline"
                    >
                      <Navigation className="w-3 h-3" />
                      {isUrdu ? "جی پی ایس لوکیشن" : "Auto GPS"}
                    </button>
                  </div>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={selectedOrigin?.name || ""}
                    onChange={(e) =>
                      setSelectedOrigin(allStops.find((s) => s.name === e.target.value) || null)
                    }
                  >
                    <option value="">{isUrdu ? "روانگی کا اسٹاپ منتخب کریں..." : "Select origin stop..."}</option>
                    {allStops.map((s) => (
                      <option key={`o-${s.name}`} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3 text-red-600" />
                    {isUrdu ? "منزل کا اسٹاپ (ڈراپ پوائنٹ)" : "Destination Stop"}
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    value={selectedDestination?.name || ""}
                    onChange={(e) =>
                      setSelectedDestination(allStops.find((s) => s.name === e.target.value) || null)
                    }
                  >
                    <option value="">{isUrdu ? "منزل کا اسٹاپ منتخب کریں..." : "Select destination stop..."}</option>
                    {allStops.map((s) => (
                      <option key={`d-${s.name}`} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nearest Stop Detection Prompt */}
                {nearestStop && !selectedOrigin && (
                  <div className="bg-slate-100 border border-slate-300 p-2 rounded text-[11px] text-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-slate-900">
                        {isUrdu ? "قریبی اسٹاپ ملا:" : "Nearest Stop Detected:"}
                      </span>
                      <span>{nearestStop.name} (~{nearestStop.distance} km)</span>
                    </div>
                    <button
                      onClick={() => setSelectedOrigin(nearestStop)}
                      className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-medium hover:bg-slate-800"
                    >
                      {isUrdu ? "منتخب کریں" : "Set Origin"}
                    </button>
                  </div>
                )}
              </div>

              {/* Journey Calculation Result Card */}
              {journeyData ? (
                <div className="bg-white border-2 border-slate-900 rounded-lg p-4 shadow-sm space-y-4">
                  {/* Summary Bar */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {isUrdu ? "کل متوقع کرایہ" : "Total Official Fare"}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900">
                        <span className="text-sm font-medium text-slate-500 mr-1">Rs.</span>
                        {journeyData.totalFare}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {isUrdu ? "متوقع وقت اور فاصلہ" : "Travel Time & Distance"}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center justify-end gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        ~{journeyData.totalTime} mins ({journeyData.totalDistance} km)
                      </h2>
                    </div>
                  </div>

                  {/* Turn-by-Turn Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {isUrdu ? "راستے کی تفصیلات اور ٹرانسفر" : "Step-by-Step Directions"}
                    </h3>

                    <div className="relative space-y-4 pl-1">
                      <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200 z-0"></div>

                      {journeyData.legs.map((leg, index) => (
                        <div key={index} className="relative z-10 flex gap-3 items-start">
                          <div className="mt-0.5 shrink-0">
                            {leg.type === "WALK" ? (
                              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center">
                                <Footprints className="w-3 h-3 text-slate-600" />
                              </div>
                            ) : (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: leg.route?.colorHex }}
                              >
                                <Bus className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900">
                                {leg.type === "WALK"
                                  ? isUrdu
                                    ? "پیدل چلیں / ٹرانسفر کریں"
                                    : "Walk / Change Terminal"
                                  : leg.route?.name}
                              </p>
                              {leg.fare && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                                  Rs. {leg.fare}
                                </span>
                              )}
                            </div>

                            {leg.type === "RIDE" && (
                              <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-slate-600">
                                <span className="flex items-center gap-1">
                                  <ArrowRightCircle className="w-3 h-3 text-slate-400 shrink-0" />
                                  {isUrdu ? "بورڈ کریں:" : "Board at"} <strong>{leg.startStop.name}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <ArrowRightCircle className="w-3 h-3 text-slate-400 shrink-0" />
                                  {isUrdu ? "اتریں:" : "Drop at"} <strong>{leg.endStop.name}</strong>
                                </span>
                              </div>
                            )}

                            {leg.type === "WALK" && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {isUrdu
                                  ? `${leg.startStop.name} سے ${leg.endStop.name} تک پیدل جائیں`
                                  : `Walk from ${leg.startStop.name} to ${leg.endStop.name}`}
                              </p>
                            )}

                            <p className="text-[10px] text-slate-400 mt-1">
                              ~{leg.timeMins} min • {leg.distanceKm} km
                              {leg.stopsPassed ? ` • ${leg.stopsPassed} stops` : ""}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Final Destination Arrival */}
                      <div className="relative z-10 flex gap-3 items-start">
                        <div className="mt-0.5 shrink-0">
                          <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">
                            {isUrdu ? "منزل پر پہنچ گئے" : "Arrive at Destination"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report on this route button */}
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full mt-2 bg-slate-100 border border-slate-300 text-slate-700 text-xs py-2 rounded font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    {isUrdu ? "اس روٹ پر تاخیر یا ٹریفک رپورٹ کریں" : "Report Delay on this Route"}
                  </button>
                </div>
              ) : (
                <div className="p-5 bg-white border border-slate-200 rounded text-center text-xs text-slate-500">
                  {isUrdu
                    ? "روٹ کی مکمل تفصیلات اور کرایہ دیکھنے کے لیے روانگی اور منزل منتخب کریں۔"
                    : "Select both an origin and destination stop above to compute direct multi-hop transfers and fares."}
                </div>
              )}

              {/* Transit Network Summary */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>{isUrdu ? "فعال روٹس" : "Active Karachi Lines"}</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700">
                    <ShieldCheck className="w-3 h-3" /> Official Rates
                  </span>
                </h4>
                {TRANSIT_ROUTES.map((r) => (
                  <div key={r.id} className="bg-white border border-slate-200 rounded p-2.5 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`${r.badgeBg} ${r.badgeText} text-[10px] font-bold px-1.5 py-0.5 rounded-sm`}>
                          {r.service}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{r.name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700">Base Rs. {r.baseFare}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {r.stops.length} major stops • {r.stops[0].name} to {r.stops[r.stops.length - 1].name}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Commuter Reports Feed */
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    {isUrdu ? "لائیو مسافر فیڈ" : "Live Commuter Feed"}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isUrdu ? "مسافروں کی طرف سے رپورٹ کردہ تاخیر" : "Real-time updates reported on ground"}
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-slate-800 flex items-center gap-1"
                >
                  + {isUrdu ? "رپورٹ درج کریں" : "Post Report"}
                </button>
              </div>

              {reports.map((rep) => (
                <div key={rep.id} className="bg-white border border-slate-200 p-3 rounded shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      {rep.routeName}
                    </span>
                    <span className="text-[10px] text-slate-400">{rep.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {rep.issueType}
                    </span>
                    <span className="text-slate-600 font-medium text-xs">Near: {rep.stopName}</span>
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

      {/* RIGHT LEAFLET MAP VIEW */}
      <main className="flex-1 bg-slate-200 relative z-10 h-1/2 md:h-full">
        <TransitMap
          routes={TRANSIT_ROUTES}
          activeLegs={journeyData ? journeyData.legs : null}
          userCoords={userCoords}
          nearestStop={nearestStop}
          onSelectAsOrigin={(s) => setSelectedOrigin(s)}
          onSelectAsDestination={(s) => setSelectedDestination(s)}
        />

        {/* Map Legend */}
        <div className="absolute top-4 right-4 bg-white/95 border border-slate-300 p-2.5 rounded shadow-sm text-[11px] space-y-1 z-[1000] hidden sm:block">
          <span className="font-bold text-slate-800 block text-xs border-b border-slate-200 pb-1">
            Karachi Lines
          </span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-700 rounded"></span> Green Line BRT
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-red-600 rounded"></span> Peoples Bus (Red)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-sky-700 rounded"></span> Electric Bus (EV)
          </div>
        </div>
      </main>

      {/* MODAL */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={(newRep) => {
          setReports([newRep, ...reports]);
          setActiveTab("reports");
        }}
        initialStopName={selectedOrigin ? selectedOrigin.name : ""}
        isUrdu={isUrdu}
      />
    </div>
  );
}
