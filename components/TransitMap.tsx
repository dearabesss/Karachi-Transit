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
  getDistanceKm,
} from "@/data/transitData";
import ReportModal from "@/components/ReportModal";
import { Navigation, AlertTriangle, Clock, Languages, Map as MapIcon, MapPin } from "lucide-react";

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
  const [includeWomenOnly, setIncludeWomenOnly] = useState<boolean>(false);
  
  const [selectedOrigin, setSelectedOrigin] = useState<BusStop | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<BusStop | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

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
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setUserCoords(null);
    setIncludeWomenOnly(false);
  };

  const allStops = useMemo(() => {
    const map = new Map<string, BusStop>();
    activeRoutes.forEach((r) => {
      if (r.service.includes("Women") && !includeWomenOnly) return;
      r.stops.forEach((s) => { if (!map.has(s.name)) map.set(s.name, s); });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeRoutes, includeWomenOnly]);

  const handleGetLocationAndSetOrigin = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);

          let closest: BusStop | null = null;
          let minDistance = Infinity;
          activeRoutes.forEach((r) => {
            if (r.service.includes("Women") && !includeWomenOnly) return;
            r.stops.forEach((s) => {
              const d = getDistanceKm(lat, lng, s.lat, s.lng);
              if (d < minDistance) {
                minDistance = d;
                closest = s;
              }
            });
          });
          
          if (closest) {
             setSelectedOrigin(closest);
          }
        },
        () => alert("Location access denied. Please select your stop manually.")
      );
    }
  };

  const journeyData = useMemo(() => {
    if (!selectedOrigin || !selectedDestination || selectedOrigin.name === selectedDestination.name) return null;
    return findFastestRoute(selectedOrigin, selectedDestination, activeRoutes, includeWomenOnly);
  }, [selectedOrigin, selectedDestination, activeRoutes, includeWomenOnly]);

  return (
    <div className="flex flex-col h-[100dvh] bg-white md:flex-row font-sans text-slate-900 overflow-hidden">
      
      <main className="flex-1 bg-slate-200 relative z-0 h-[35dvh] md:h-full w-full order-1 md:order-2 border-b md:border-b-0 md:border-l border-slate-300">
        <TransitMap
          routes={activeRoutes}
          activeLegs={journeyData ? journeyData.legs : null}
          hoveredLegIndex={hoveredLegIndex}
          userCoords={userCoords}
          cityCenter={activeCityConfig.center}
          onSelectAsOrigin={(s) => setSelectedOrigin(s)}
          onSelectAsDestination={(s) => setSelectedDestination(s)}
          includeWomenOnly={includeWomenOnly}
        />
      </main>

      <aside className="w-full md:w-[420px] bg-white flex flex-col z-20 shrink-0 h-[65dvh] md:h-full order-2 md:order-1 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-none rounded-t-2xl md:rounded-none -mt-4 md:mt-0 relative overflow-hidden">
        
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1.5 md:hidden"></div>

        <header className="px-5 pb-3 pt-2 md:pt-4 bg-white text-slate-900 flex items-center justify-between shrink-0 border-b border-slate-200">
          <h1 className="text-lg font-black tracking-tight">{isUrdu ? "پاک ٹرانزٹ" : "Pak Transit"}</h1>
          <button onClick={() => setIsUrdu(!isUrdu)} className="flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-300 text-slate-800 px-2.5 py-1.5 rounded font-bold hover:bg-slate-200">
            <Languages className="w-4 h-4 text-emerald-600" /> {isUrdu ? "English" : "اردو"}
          </button>
        </header>

        <div className="bg-slate-900 px-5 py-3 border-t border-slate-700 shrink-0 flex items-center gap-3">
           <MapIcon className="w-5 h-5 text-slate-400" />
           <select 
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value as CityId)}
              className="bg-slate-900 text-white text-base md:text-sm font-bold focus:outline-none w-full cursor-pointer appearance-none"
           >
              {CITIES.map(city => <option key={city.id} value={city.id}>{isUrdu ? city.urduName : city.name} Transit Network</option>)}
           </select>
        </div>

        <div className="flex border-b border-slate-200 px-5 pt-3 bg-slate-50 shrink-0">
          <button onClick={() => setActiveTab("plan")} className={`pb-2 mr-5 text-sm font-bold uppercase tracking-wider border-b-[3px] ${activeTab === "plan" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"}`}>
            {isUrdu ? "روٹ پلانر" : "Plan Trip"}
          </button>
          <button onClick={() => setActiveTab("reports")} className={`pb-2 text-sm font-bold uppercase tracking-wider border-b-[3px] flex items-center gap-1.5 ${activeTab === "reports" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"}`}>
            {isUrdu ? "لائیو الرٹس" : "Alerts"}
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{reports.length}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-12">
          {activeTab === "plan" ? (
            <>
              <div className="space-y-4">
                <button 
                  onClick={handleGetLocationAndSetOrigin}
                  className="w-full bg-slate-100 text-slate-800 border border-slate-300 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  {isUrdu ? "قریبی اسٹاپ تلاش کریں" : "Find Nearest Stop via GPS"}
                </button>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase mb-1.5 block">{isUrdu ? "روانگی" : "Origin"}</label>
                  <select
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-3 text-base md:text-sm font-medium focus:border-slate-900 bg-white"
                    value={selectedOrigin?.name || ""}
                    onChange={(e) => setSelectedOrigin(allStops.find(s => s.name === e.target.value) || null)}
                  >
                    <option value="">Select origin...</option>
                    {allStops.map((s) => <option key={`o-${s.name}`} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">{isUrdu ? "منزل" : "Destination"}</label>
                  <select
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-3 text-base md:text-sm font-medium focus:border-slate-900 bg-white"
                    value={selectedDestination?.name || ""}
                    onChange={(e) => setSelectedDestination(allStops.find(s => s.name === e.target.value) || null)}
                  >
                    <option value="">Select destination...</option>
                    {allStops.map((s) => <option key={`d-${s.name}`} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                {selectedCityId === "karachi" && (
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer bg-pink-50 border border-pink-200 p-2.5 rounded-lg hover:bg-pink-100 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                        checked={includeWomenOnly}
                        onChange={(e) => setIncludeWomenOnly(e.target.checked)}
                      />
                      <span className="text-xs font-bold text-pink-900">
                        {isUrdu ? "خواتین کے مخصوص روٹس شامل کریں (پنک بس)" : "Include Women-Only Routes (Pink Bus)"}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {journeyData ? (
                <div className="space-y-5">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{isUrdu ? "کل کرایہ" : "Total Fare"}</p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">Rs. {journeyData.totalFare}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{isUrdu ? "وقت" : "Est. Time"}</p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5 flex items-end gap-1">
                        {journeyData.totalTime} <span className="text-sm font-bold text-slate-500 mb-0.5">min</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-l-[3px] border-slate-200 pl-5 ml-2 mt-6">
                    {journeyData.legs.map((leg, index) => (
                      <div 
                        key={index} 
                        className="relative pb-2"
                        onMouseEnter={() => setHoveredLegIndex(index)}
                        onMouseLeave={() => setHoveredLegIndex(null)}
                      >
                        <div 
                          className="absolute -left-[29px] top-1 w-4 h-4 rounded-full border-[3px] border-white"
                          style={{ backgroundColor: leg.type === "WALK" ? "#94a3b8" : leg.route?.colorHex }}
                        ></div>
                        
                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          {leg.type === "WALK" ? (isUrdu ? "پیدل / ٹرانسفر" : "Walk / Transfer") : leg.route?.name}
                        </h4>
                        
                        <div className="mt-2 space-y-1">
                           <p className="text-sm text-slate-700"><span className="font-semibold text-slate-500">{leg.type === "WALK" ? "From:" : "Board:"}</span> {leg.startStop.name}</p>
                           <p className="text-sm text-slate-700"><span className="font-semibold text-slate-500">{leg.type === "WALK" ? "To:" : "Drop:"}</span> {leg.endStop.name}</p>
                        </div>

                        <div className="mt-2 text-xs font-semibold text-slate-500 flex gap-3">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{leg.timeMins} min</span>
                          <span>{leg.distanceKm} km</span>
                          {leg.fare && <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Rs. {leg.fare}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-8 rounded-xl text-center">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-base font-bold text-slate-600">Select Locations</p>
                  <p className="text-sm text-slate-500 mt-1">Select an origin and destination to generate a route.</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setIsReportModalOpen(true)} className="w-full bg-slate-900 text-white text-base font-bold py-3.5 rounded-lg hover:bg-slate-800 shadow-md">
                + {isUrdu ? "نئی رپورٹ شامل کریں" : "Post Update"}
              </button>
              {reports.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-8 rounded-xl text-center mt-4">
                  <p className="text-base font-bold text-slate-600">No active alerts</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-sm">
                    <div className="flex justify-between"><span className="text-sm font-bold text-slate-900">{rep.routeName}</span><span className="text-xs text-slate-500">{rep.timestamp}</span></div>
                    <div className="flex gap-2 flex-wrap"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold border border-slate-200">{rep.issueType}</span><span className="text-sm text-slate-600">@ {rep.stopName}</span></div>
                    <p className="text-sm text-slate-700 pt-1">{rep.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSuccess={(newRep) => { setReports([newRep, ...reports]); setActiveTab("reports"); }} activeRoutes={activeRoutes} initialStopName={selectedOrigin ? selectedOrigin.name : ""} isUrdu={isUrdu} />
    </div>
  );
}
