"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { TransitRoute, BusStop, RouteLeg } from "@/data/transitData";

const defaultStopIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  popupAnchor: [0, -32],
  shadowSize: [36, 36],
});

const userPinIcon = L.divIcon({
  className: "user-loc-pin",
  html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 0 2px #2563eb;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapViewController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

interface TransitMapProps {
  routes: TransitRoute[];
  activeLegs: RouteLeg[] | null;
  userCoords: [number, number] | null;
  nearestStop: BusStop | null;
  onSelectAsOrigin: (stop: BusStop) => void;
  onSelectAsDestination: (stop: BusStop) => void;
}

export default function TransitMap({
  routes,
  activeLegs,
  userCoords,
  nearestStop,
  onSelectAsOrigin,
  onSelectAsDestination,
}: TransitMapProps) {
  const centerPos: [number, number] = nearestStop
    ? [nearestStop.lat, nearestStop.lng]
    : userCoords || [24.8934, 67.0822];

  return (
    <MapContainer center={centerPos} zoom={12} scrollWheelZoom={true} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewController center={centerPos} />

      {/* User GPS Pin */}
      {userCoords && (
        <Marker position={userCoords} icon={userPinIcon}>
          <Popup>
            <div className="p-1 font-sans text-xs">
              <strong className="block text-slate-900 font-bold">Your Location</strong>
              <span className="text-slate-500">Live GPS Coordinates</span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Default Bus Route Lines */}
      {routes.map((route) => {
        const coords: [number, number][] = route.stops.map((s) => [s.lat, s.lng]);
        return (
          <Polyline
            key={route.id}
            positions={coords}
            pathOptions={{
              color: route.colorHex,
              weight: activeLegs ? 2 : 4,
              opacity: activeLegs ? 0.3 : 0.85,
            }}
          />
        );
      })}

      {/* Active High-Contrast Navigation Journey Overlay */}
      {activeLegs &&
        activeLegs.map((leg, idx) => {
          if (leg.type === "WALK") {
            return (
              <Polyline
                key={`leg-walk-${idx}`}
                positions={[
                  [leg.startStop.lat, leg.startStop.lng],
                  [leg.endStop.lat, leg.endStop.lng],
                ]}
                pathOptions={{
                  color: "#475569",
                  weight: 4,
                  dashArray: "6, 8",
                  opacity: 0.9,
                }}
              />
            );
          }
          return (
            <Polyline
              key={`leg-ride-${idx}`}
              positions={[
                [leg.startStop.lat, leg.startStop.lng],
                [leg.endStop.lat, leg.endStop.lng],
              ]}
              pathOptions={{
                color: leg.route?.colorHex || "#0f172a",
                weight: 7,
                opacity: 1,
              }}
            />
          );
        })}

      {/* Stop Markers */}
      {routes.map((route) =>
        route.stops.map((stop) => (
          <Marker
            key={`${route.id}-${stop.id}`}
            position={[stop.lat, stop.lng]}
            icon={defaultStopIcon}
          >
            <Popup>
              <div className="p-1.5 font-sans min-w-[180px]">
                <span
                  className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-white rounded mb-1"
                  style={{ backgroundColor: route.colorHex }}
                >
                  {route.service}
                </span>
                <p className="font-bold text-slate-900 text-sm">{stop.name}</p>
                <p className="text-slate-500 text-[11px] mb-2">{route.fareRule}</p>
                
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAsOrigin(stop);
                    }}
                    className="bg-emerald-700 text-white text-[10px] font-semibold py-1 rounded hover:bg-emerald-800 text-center"
                  >
                    Set Origin
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAsDestination(stop);
                    }}
                    className="bg-slate-900 text-white text-[10px] font-semibold py-1 rounded hover:bg-slate-800 text-center"
                  >
                    Set Dest
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
}
