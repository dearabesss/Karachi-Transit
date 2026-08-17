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
  MapPin,
  Footprints,
  Navigation,
  AlertTriangle,
  Clock,
  Languages,
} from "lucide-react";

const TransitMap = dynamic(() => import("@/components/TransitMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 text-base font-medium">
      Loading Map Data...
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
        // Fallback
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
          alert("Location access denied.");
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
    <div className="flex flex-col h-screen bg-white md:flex-row font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR PANEL */}
      <aside className="w-full md:w-[480px] bg-white border-r border-slate-300 flex flex-col z-20 shrink-0 h-[55%] md:h-full">
        
        {/* Header */}
        <header className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {isUrdu ? "کراچی ٹرانزٹ" : "Karachi Transit"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">Route & Fare Calculator</p>
          </div>
          <button
            onClick={() => setIsUrdu(!isUrdu)}
            className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded transition-colors"
          >
            <Languages className="w-4 h-4 text-white" />
            {isUrdu ? "English" : "اردو"}
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-4 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab("plan")}
            className={`pb-3 mr-6 text-sm font-bold uppercase tracking-wider border-b-4 transition-colors ${
              activeTab === "plan"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {isUrdu ? "روٹ تلاش کریں" : "Plan Trip"}
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-4 transition-colors flex items-center gap-2 ${
              activeTab === "reports"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {isUrdu ? "لائیو الرٹس" : "Live Alerts"}
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {reports.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "plan" ? (
            <>
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-slate-700">
                      {isUrdu ? "روانگی (کہاں سے؟)" : "Origin (Where from?)"}
                    </label>
                    <button
                      onClick={handleGetLocation}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Navigation className="w-4 h-4" />
                      {isUrdu ? "جی پی ایس لوکیشن" : "Use GPS"}
                    </button>
                  </div>
                  <select
                    className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                    value={selectedOrigin?.name || ""}
                    onChange={(e) =>
                      setSelectedOrigin(allStops.find((s) => s.name === e.target.value) || null)
                    }
                  >
                    <option value="">{isUrdu ? "اسٹاپ منتخب کریں..." : "Select start location..."}</option>
                    {allStops.map((s) => (
                      <option key={`o-${s.name}`} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">
                    {isUrdu ? "منزل (کہاں جانا ہے؟)" : "Destination (Where to?)"}
                  </label>
                  <select
                    className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                    value={selectedDestination?.name || ""}
                    onChange={(e) =>
                      setSelectedDestination(allStops.find((s) => s.name === e.target.value) || null)
                    }
                  >
                    <option value="">{isUrdu ? "اسٹاپ منتخب کریں..." : "Select destination..."}</option>
                    {allStops.map((s) => (
                      <option key={`d-${s.name}`} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear divider */}
              <hr className="border-t-2 border-slate-100" />

              {/* Journey Result */}
              {journeyData ? (
                <div className="space-y-6">
                  {/* Totals */}
                  <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <p className="text-sm font-bold text-slate-500 uppercase">{isUrdu ? "کرایہ" : "Fare"}</p>
                      <p className="text-3xl font-black text-slate-900 mt-1">Rs. {journeyData.totalFare}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <p className="text-sm font-bold text-slate-500 uppercase">{isUrdu ? "وقت" : "Time"}</p>
                      <p className="text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
                        {journeyData.totalTime} <span className="text-base font-bold text-slate-500">min</span>
                      </p>
                    </div>
                  </div>

                  {/* Directions list */}
                  <div className="space-y-5 border-l-4 border-slate-200 pl-5 ml-2">
                    {journeyData.legs.map((leg, index) => (
                      <div key={index} className="relative">
                        {/* Dot indicator */}
                        <div 
                          className="absolute -left-[30px] top-1 w-4 h-4 rounded-full border-4 border-white"
                          style={{ backgroundColor: leg.type === "WALK" ? "#94a3b8" : leg.route?.colorHex }}
                        ></div>
                        
                        <h4 className="text-lg font-bold text-slate-900 leading-none">
                          {leg.type === "WALK" ? (isUrdu ? "پیدل چلیں" : "Walk") : leg.route?.name}
                        </h4>
                        
                        {leg.type === "RIDE" && (
                          <div className="mt-3 space-y-1">
                            <p className="text-base text-slate-700"><span className="font-bold">Board:</span> {leg.startStop.name}</p>
                            <p className="text-base text-slate-700"><span className="font-bold">Drop:</span> {leg.endStop.name}</p>
                          </div>
                        )}
                        
                        {leg.type === "WALK" && (
                           <p className="text-base text-slate-700 mt-2">To {leg.endStop.name}</p>
                        )}

                        <div className="mt-2 text-sm font-bold text-slate-500 flex gap-3">
                          <span>{leg.timeMins} min</span>
                          <span>{leg.distanceKm} km</span>
                          {leg.fare && <span className="text-slate-900">Rs. {leg.fare}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full bg-red-50 text-red-700 border border-red-200 text-base font-bold py-4 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    {isUrdu ? "اس روٹ پر رپورٹ درج کریں" : "Report an Issue on this Route"}
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-lg text-center">
                  <p className="text-base font-bold text-slate-500">
                    {isUrdu
                      ? "اپنا راستہ دیکھنے کے لیے اوپر اسٹاپ منتخب کریں"
                      : "Select your starting and ending locations above to calculate the route."}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Reports Feed */
            <div className="space-y-4">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full bg-slate-900 text-white text-base font-bold py-4 rounded-lg hover:bg-slate-800 transition-colors"
              >
                + {isUrdu ? "نئی رپورٹ شامل کریں" : "Post a Live Update"}
              </button>

              {reports.map((rep) => (
                <div key={rep.id} className="bg-white border-2 border-slate-200 p-5 rounded-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-900">{rep.routeName}</span>
                    <span className="text-sm font-medium text-slate-500">{rep.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-900 px-3 py-1 rounded text-sm font-bold border border-slate-300">
                      {rep.issueType}
                    </span>
                    <span className="text-slate-700 font-medium text-sm">@ {rep.stopName}</span>
                  </div>
                  
                  <p className="text-base text-slate-800 pt-2">{rep.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAP VIEW */}
      <main className="flex-1 bg-slate-200 relative z-10 h-[45%] md:h-full border-t md:border-t-0 md:border-l border-slate-300">
        <TransitMap
          routes={TRANSIT_ROUTES}
          activeLegs={journeyData ? journeyData.legs : null}
          userCoords={userCoords}
          nearestStop={null} // Map centers natively on bounding box now
          onSelectAsOrigin={(s) => setSelectedOrigin(s)}
          onSelectAsDestination={(s) => setSelectedDestination(s)}
        />
      </main>

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
