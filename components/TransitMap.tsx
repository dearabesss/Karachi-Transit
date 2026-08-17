"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { TransitRoute, BusStop, RouteLeg } from "@/data/transitData";

const defaultStopIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -32],
  shadowSize: [41, 41],
});

const userPinIcon = L.divIcon({
  className: "user-loc-pin",
  html: `<div style="background-color: #2563eb; width: 18px; height: 18px; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 0 2px #2563eb;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapViewController({ center, zoom, bounds }: { center: [number, number]; zoom?: number; bounds?: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], duration: 0.8 });
    } else {
      map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

interface TransitMapProps {
  routes: TransitRoute[];
  activeLegs: RouteLeg[] | null;
  userCoords: [number, number] | null;
  nearestStop: BusStop | null;
  cityCenter: [number, number];
  onSelectAsOrigin: (stop: BusStop) => void;
  onSelectAsDestination: (stop: BusStop) => void;
}

export default function TransitMap({
  routes,
  activeLegs,
  userCoords,
  nearestStop,
  cityCenter,
  onSelectAsOrigin,
  onSelectAsDestination,
}: TransitMapProps) {
  
  const centerPos: [number, number] = nearestStop
    ? [nearestStop.lat, nearestStop.lng]
    : userCoords || cityCenter;

  let journeyBounds: L.LatLngBounds | undefined;
  if (activeLegs && activeLegs.length > 0) {
    const latLngs: [number, number][] = [];
    activeLegs.forEach(leg => {
      latLngs.push([leg.startStop.lat, leg.startStop.lng]);
      latLngs.push([leg.endStop.lat, leg.endStop.lng]);
    });
    journeyBounds = L.latLngBounds(latLngs);
  }

  const activeStops = new Set<string>();
  if (activeLegs) {
    activeLegs.forEach(leg => {
      activeStops.add(leg.startStop.id);
      activeStops.add(leg.endStop.id);
    });
  }

  return (
    <MapContainer center={cityCenter} zoom={12} scrollWheelZoom={true} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewController center={centerPos} bounds={journeyBounds} />

      {userCoords && (
        <Marker position={userCoords} icon={userPinIcon}>
          <Popup>
            <div className="p-2 font-sans">
              <strong className="block text-slate-900 text-sm font-bold">Your Location</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {!activeLegs && routes.map((route) => {
        const coords: [number, number][] = route.stops.map((s) => [s.lat, s.lng]);
        return (
          <Polyline
            key={route.id}
            positions={coords}
            pathOptions={{
              color: route.colorHex,
              weight: 4,
              opacity: 0.7,
            }}
          />
        );
      })}

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
                  color: "#334155",
                  weight: 5,
                  dashArray: "8, 10",
                  opacity: 1,
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
                weight: 8,
                opacity: 1,
              }}
            />
          );
        })}

      {routes.map((route) =>
        route.stops.map((stop) => {
          if (activeLegs && !activeStops.has(stop.id)) return null;

          return (
            <Marker
              key={`${route.id}-${stop.id}`}
              position={[stop.lat, stop.lng]}
              icon={defaultStopIcon}
            >
              <Popup>
                <div className="p-2 font-sans min-w-[200px]">
                  <span
                    className="inline-block px-2 py-1 text-xs font-bold text-white rounded mb-2"
                    style={{ backgroundColor: route.colorHex }}
                  >
                    {route.service}
                  </span>
                  <p className="font-bold text-slate-900 text-base">{stop.name}</p>
                  <p className="text-slate-600 text-sm mb-3">{route.fareRule}</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsOrigin(stop);
                      }}
                      className="bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold py-2 rounded hover:bg-slate-200 text-center"
                    >
                      Set Origin
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsDestination(stop);
                      }}
                      className="bg-slate-900 text-white border border-slate-900 text-sm font-bold py-2 rounded hover:bg-slate-800 text-center"
                    >
                      Set Dest
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })
      )}
    </MapContainer>
  );
}
