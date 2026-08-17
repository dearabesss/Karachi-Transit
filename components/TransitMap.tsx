"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
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

const customPinIcon = L.divIcon({
  className: "custom-pin",
  html: `<div style="background-color: #0f172a; width: 16px; height: 16px; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 0 2px #0f172a;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapViewController({ center, bounds }: { center: [number, number]; bounds?: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], duration: 0.8 });
    } else {
      map.flyTo(center, 13, { duration: 0.8 });
    }
  }, [center, bounds, map]);
  return null;
}

function MapClickListener({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface TransitMapProps {
  routes: TransitRoute[];
  activeLegs: RouteLeg[] | null;
  hoveredLegIndex: number | null;
  cityCenter: [number, number];
  customOriginCoords: [number, number] | null;
  customDestCoords: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
  onSelectAsOrigin: (stop: BusStop) => void;
  onSelectAsDestination: (stop: BusStop) => void;
}

export default function TransitMap({
  routes,
  activeLegs,
  hoveredLegIndex,
  cityCenter,
  customOriginCoords,
  customDestCoords,
  onMapClick,
  onSelectAsOrigin,
  onSelectAsDestination,
}: TransitMapProps) {
  
  let journeyBounds: L.LatLngBounds | undefined;
  if (activeLegs && activeLegs.length > 0) {
    const latLngs: [number, number][] = [];
    activeLegs.forEach(leg => {
      latLngs.push([leg.startLat, leg.startLng]);
      latLngs.push([leg.endLat, leg.endLng]);
    });
    journeyBounds = L.latLngBounds(latLngs);
  }

  const activeStops = new Set<string>();
  if (activeLegs) {
    activeLegs.forEach(leg => {
      if (leg.type === "RIDE") {
        activeStops.add(`${leg.startLat},${leg.startLng}`);
        activeStops.add(`${leg.endLat},${leg.endLng}`);
      }
    });
  }

  return (
    <MapContainer center={cityCenter} zoom={13} scrollWheelZoom={true} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewController center={cityCenter} bounds={journeyBounds} />
      <MapClickListener onMapClick={onMapClick} />

      {customOriginCoords && (
        <Marker position={customOriginCoords} icon={customPinIcon}>
          <Popup><strong className="font-sans text-xs">Origin Pin</strong></Popup>
        </Marker>
      )}
      {customDestCoords && (
        <Marker position={customDestCoords} icon={customPinIcon}>
          <Popup><strong className="font-sans text-xs">Destination Pin</strong></Popup>
        </Marker>
      )}

      {!activeLegs && routes.map((route) => {
        const coords: [number, number][] = route.stops.map((s) => [s.lat, s.lng]);
        return (
          <Polyline
            key={route.id}
            positions={coords}
            pathOptions={{ color: route.colorHex, weight: 4, opacity: 0.7 }}
          />
        );
      })}

      {activeLegs &&
        activeLegs.map((leg, idx) => {
          const isHovered = hoveredLegIndex === idx;
          if (leg.type === "WALK") {
            return (
              <Polyline
                key={`leg-walk-${idx}`}
                positions={[ [leg.startLat, leg.startLng], [leg.endLat, leg.endLng] ]}
                pathOptions={{
                  color: isHovered ? "#000000" : "#64748b",
                  weight: isHovered ? 6 : 4,
                  dashArray: "6, 8",
                  opacity: 1,
                }}
              />
            );
          }
          return (
            <Polyline
              key={`leg-ride-${idx}`}
              positions={[ [leg.startLat, leg.startLng], [leg.endLat, leg.endLng] ]}
              pathOptions={{
                color: leg.route?.colorHex || "#0f172a",
                weight: isHovered ? 10 : 7,
                opacity: isHovered ? 1 : 0.8,
              }}
            />
          );
        })}

      {routes.map((route) =>
        route.stops.map((stop) => {
          if (activeLegs && !activeStops.has(`${stop.lat},${stop.lng}`)) return null;

          return (
            <Marker key={`${route.id}-${stop.id}`} position={[stop.lat, stop.lng]} icon={defaultStopIcon}>
              <Popup>
                <div className="p-2 font-sans min-w-[200px]">
                  <span className="inline-block px-2 py-1 text-xs font-bold text-white rounded mb-2" style={{ backgroundColor: route.colorHex }}>
                    {route.service}
                  </span>
                  <p className="font-bold text-slate-900 text-base">{stop.name}</p>
                  <p className="text-slate-600 text-sm mb-3">{route.fareRule}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <button onClick={(e) => { e.stopPropagation(); onSelectAsOrigin(stop); }} className="bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold py-2 rounded hover:bg-slate-200 text-center">Set Origin</button>
                    <button onClick={(e) => { e.stopPropagation(); onSelectAsDestination(stop); }} className="bg-slate-900 text-white border border-slate-900 text-sm font-bold py-2 rounded hover:bg-slate-800 text-center">Set Dest</button>
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
