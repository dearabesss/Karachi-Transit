"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  CITIES,
  CityId,
  TRANSIT_DATA,
  INITIAL_REPORTS,
  BusStop,
  DelayReport,
  findFastestRoute,
} from "@/data/transitData";
import ReportModal from "@/components/ReportModal";
import { Navigation, AlertTriangle, Clock, Languages, Map as MapIcon, Footprints, Bus, CheckCircle2, MapPin } from "lucide-react";

const TransitMap = dynamic(() => import("@/components/TransitMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 text-sm font-medium">
      Loading Interactive Map...
    </div>
  ),
});

export default function NationalTransitApp() {
  const [isUrdu, setIsUrdu] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<CityId>("karachi");
  const [activeTab, setActiveTab] = useState<"plan" | "reports">("plan");
  
  const [selectedOriginType, setSelectedOriginType] = useState<"stop" | "custom" | null>(null);
  const [selectedOriginStop, setSelectedOriginStop] = useState<BusStop | null>(null);
  const [customOriginCoords, setCustomOriginCoords] = useState<[number, number] | null>(null);

  const [selectedDestType, setSelectedDestType] = useState<"stop" | "custom" | null>(null);
  const [selectedDestStop, setSelectedDestStop] = useState<BusStop | null>(null);
  const [customDestCoords, setCustomDestCoords] = useState<[number, number] | null>(null);

  const [hoveredLegIndex, setHoveredLegIndex] = useState<number | null>(null);
  const [reports, setReports] = useState<DelayReport[]>(INITIAL_REPORTS);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const activeCityConfig = CITIES.find((c) => c.id === selectedCityId)!;
  const activeRoutes = TRANSIT_DATA[selectedCityId];

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (data.reports) setReports(data.reports);
      } catch {}
    }
    fetchReports();
  }, []);

  const handleCityChange = (newCityId: CityId) => {
    setSelectedCityId(newCityId);
    setSelectedOriginType(null);
    setSelectedDestType(null);
    setCustomOriginCoords(null);
    setCustomDestCoords(null);
  };

  const allStops = useMemo(() => {
    const map = new Map<string, BusStop>();
    activeRoutes.forEach((r) => r.stops.forEach((s) => { if (!map.has(s.name)) map.set(s.name, s); }));
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeRoutes]);

  const handleMapClick = (lat: number, lng: number) => {
    if (activeTab !== "plan") return;
    if (!selectedOriginType) {
      setSelectedOriginType("custom");
      setCustomOriginCoords([lat, lng]);
    } else if (!selectedDestType) {
      setSelectedDestType("custom");
      setCustomDestCoords([lat, lng]);
    } else {
      setSelectedOriginType("custom");
      setCustomOriginCoords([lat, lng]);
      setSelectedDestType(null);
      setCustomDestCoords(null);
    }
  };

  const journeyData = useMemo(() => {
    const originRaw = selectedOriginType === "custom" ? customOriginCoords : selectedOriginStop;
    const destRaw = selectedDestType === "custom" ? customDestCoords : selectedDestStop;
    if (!originRaw || !destRaw) return null;
    return findFastestRoute(originRaw, destRaw, activeRoutes);
  }, [selectedOriginType, customOriginCoords, selectedOriginStop, selectedDestType, customDestCoords, selectedDestStop, activeRoutes]);

  return (
    <div className="flex flex-col h-screen bg-white md:flex-row font-sans text-slate-900 overflow-hidden">
      <aside className="w-full md:w-[420px] bg-white border-r border-slate-300 flex flex-col z-20 shrink-0 h-[55%] md:h-full">
        
        <header className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <h1 className="text-base font-bold tracking-tight">{isUrdu ? "پاک ٹرانزٹ" : "Pak Transit"}</h1>
          <button onClick={() => setIsUrdu(!isUrdu)} className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-600 px-2 py-1 rounded">
            <Languages className="w-3.5 h-3.5 text-emerald-400" /> {isUrdu ? "English" : "اردو"}
          </button>
        </header>

        <div className="bg-slate-800 px-5 py-2.5 border-t border-slate-700 shrink-0 flex items-center gap-3">
           <MapIcon className="w-4 h-4 text-slate-400" />
           <select 
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value as CityId)}
              className="bg-slate-800 text-white text-sm font-bold focus:outline-none w-full cursor-pointer"
           >
              {CITIES.map(city => <option key={city.id} value={city.id}>{isUrdu ? city.urduName : city.name} Network</option>)}
           </select>
        </div>

        <div className="flex border-b border-slate-200 px-5 pt-3 bg-slate-50 shrink-0">
          <button onClick={() => setActiveTab("plan")} className={`pb-2 mr-5 text-xs font-bold uppercase tracking-wider border-b-[3px] ${activeTab === "plan" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"}`}>
            {isUrdu ? "روٹ پلانر" : "Route Planner"}
          </button>
          <button onClick={() => setActiveTab("reports")} className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-[3px] flex items-center gap-1.5 ${activeTab === "reports" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"}`}>
            {isUrdu ? "لائیو الرٹس" : "Live Alerts"}
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{reports.length}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "plan" ? (
            <>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium mb-4 bg-slate-100 p-2 rounded border border-slate-200">
                  <span className="font-bold text-slate-700">Pro Tip:</span> Click anywhere on the map to drop a pin and calculate walking distance to the nearest station!
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase mb-1.5 block">{isUrdu ? "روانگی" : "Origin"}</label>
                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-medium focus:border-slate-900"
                    value={selectedOriginType === "custom" ? "custom" : selectedOriginStop?.name || ""}
                    onChange={(e) => {
                      if (e.target.value === "custom") return;
                      setSelectedOriginType("stop");
                      setSelectedOriginStop(allStops.find(s => s.name === e.target.value) || null);
                    }}
                  >
                    <option value="">Select origin...</option>
                    {selectedOriginType === "custom" && <option value="custom">📍 Dropped Pin (Map Click)</option>}
                    {allStops.map((s) => <option key={`o-${s.name}`} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">{isUrdu ? "منزل" : "Destination"}</label>
                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-medium focus:border-slate-900"
                    value={selectedDestType === "custom" ? "custom" : selectedDestStop?.name || ""}
                    onChange={(e) => {
                      if (e.target.value === "custom") return;
                      setSelectedDestType("stop");
                      setSelectedDestStop(allStops.find(s => s.name === e.target.value) || null);
                    }}
                  >
                    <option value="">Select destination...</option>
                    {selectedDestType === "custom" && <option value="custom">📍 Dropped Pin (Map Click)</option>}
                    {allStops.map((s) => <option key={`d-${s.name}`} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {journeyData ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{isUrdu ? "کل کرایہ" : "Total Fare"}</p>
                      <p className="text-xl font-black text-slate-900 mt-0.5">Rs. {journeyData.totalFare}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{isUrdu ? "وقت" : "Est. Time"}</p>
                      <p className="text-xl font-black text-slate-900 mt-0.5 flex items-end gap-1">
                        {journeyData.totalTime} <span className="text-xs font-bold text-slate-500 mb-0.5">min</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-l-[3px] border-slate-200 pl-4 ml-1">
                    {journeyData.legs.map((leg, index) => (
                      <div 
                        key={index} 
                        className="relative p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                        onMouseEnter={() => setHoveredLegIndex(index)}
                        onMouseLeave={() => setHoveredLegIndex(null)}
                      >
                        <div 
                          className="absolute -left-[27px] top-3 w-3 h-3 rounded-full border-2 border-white"
                          style={{ backgroundColor: leg.type === "WALK" ? "#94a3b8" : leg.route?.colorHex }}
                        ></div>
                        
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {leg.type === "WALK" ? (isUrdu ? "پیدل" : "Walk") : leg.route?.name}
                        </h4>
                        
                        <div className="mt-1.5 space-y-0.5">
                           <p className="text-xs text-slate-700"><span className="font-semibold text-slate-500">{leg.type === "WALK" ? "From:" : "Board:"}</span> {leg.startName}</p>
                           <p className="text-xs text-slate-700"><span className="font-semibold text-slate-500">{leg.type === "WALK" ? "To:" : "Drop:"}</span> {leg.endName}</p>
                        </div>

                        <div className="mt-1.5 text-[11px] font-semibold text-slate-500 flex gap-2.5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{leg.timeMins} min</span>
                          <span>{leg.distanceKm} km</span>
                          {leg.fare && <span className="text-slate-800">Rs. {leg.fare}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setIsReportModalOpen(true)} className="w-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold py-2.5 rounded hover:bg-red-100 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> {isUrdu ? "مسئلہ رپورٹ کریں" : "Report Issue on Route"}
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded text-center">
                  <MapPin className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">Select Locations</p>
                  <p className="text-xs text-slate-500 mt-1">Click the map or use the dropdowns to generate a route.</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <button onClick={() => setIsReportModalOpen(true)} className="w-full bg-slate-900 text-white text-sm font-bold py-2.5 rounded hover:bg-slate-800">
                + {isUrdu ? "نئی رپورٹ شامل کریں" : "Post Update"}
              </button>
              {reports.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded text-center mt-4">
                  <p className="text-sm font-bold text-slate-600">No active alerts</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="bg-white border border-slate-200 p-3.5 rounded space-y-2">
                    <div className="flex justify-between"><span className="text-xs font-bold">{rep.routeName}</span><span className="text-[10px] text-slate-500">{rep.timestamp}</span></div>
                    <div className="flex gap-1.5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">{rep.issueType}</span><span className="text-xs text-slate-600">@ {rep.stopName}</span></div>
                    <p className="text-xs text-slate-700">{rep.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-slate-200 relative z-10 h-[45%] md:h-full border-t md:border-l border-slate-300">
        <TransitMap
          routes={activeRoutes}
          activeLegs={journeyData ? journeyData.legs : null}
          hoveredLegIndex={hoveredLegIndex}
          customOriginCoords={customOriginCoords}
          customDestCoords={customDestCoords}
          cityCenter={activeCityConfig.center}
          onMapClick={handleMapClick}
          onSelectAsOrigin={(s) => { setSelectedOriginType("stop"); setSelectedOriginStop(s); }}
          onSelectAsDestination={(s) => { setSelectedDestType("stop"); setSelectedDestStop(s); }}
        />
      </main>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSuccess={(newRep) => { setReports([newRep, ...reports]); setActiveTab("reports"); }} activeRoutes={activeRoutes} isUrdu={isUrdu} />
    </div>
  );
}
