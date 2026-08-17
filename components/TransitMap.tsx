"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { TransitRoute, BusStop } from "@/data/transitData";

// Fix Leaflet marker icons in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userLocationIcon = L.divIcon({
  className: "custom-user-icon",
  html: `<div style="background-color: #0284c7; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 2px #0284c7;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface TransitMapProps {
  routes: TransitRoute[];
  selectedRoute: TransitRoute | null;
  userCoords: [number, number] | null;
  nearestStop: BusStop | null;
  onSelectStop: (stop: BusStop, route: TransitRoute) => void;
}

export default function TransitMap({
  routes,
  selectedRoute,
  userCoords,
  nearestStop,
  onSelectStop,
}: TransitMapProps) {
  const defaultCenter: [number, number] = userCoords || [24.8934, 67.0822]; // Karachi Center

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapRecenter center={nearestStop ? [nearestStop.lat, nearestStop.lng] : defaultCenter} />

      {/* User Location Marker */}
      {userCoords && (
        <Marker position={userCoords} icon={userLocationIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <strong className="text-slate-900 block font-bold">Your Location</strong>
              <span className="text-slate-500">Nearest transit search origin</span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Render Route Paths */}
      {routes.map((route) => {
        const isSelected = selectedRoute ? selectedRoute.id === route.id : true;
        return (
          <Polyline
            key={route.id}
            positions={route.path}
            pathOptions={{
              color: route.colorHex,
              weight: isSelected ? 5 : 2,
              opacity: isSelected ? 0.9 : 0.35,
            }}
          />
        );
      })}

      {/* Render Bus Stops */}
      {routes.map((route) =>
        route.stops.map((stop) => {
          const isSelected = selectedRoute ? selectedRoute.id === route.id : true;
          const isNearest = nearestStop?.id === stop.id;

          if (!isSelected && !isNearest) return null;

          return (
            <Marker
              key={`${route.id}-${stop.id}`}
              position={[stop.lat, stop.lng]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => onSelectStop(stop, route),
              }}
            >
              <Popup>
                <div className="font-sans text-xs p-1">
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-white rounded mb-1" style={{ backgroundColor: route.colorHex }}>
                    {route.service}
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{stop.name}</p>
                  <p className="text-slate-500 mt-1">{route.fareRule}</p>
                  <button
                    onClick={() => onSelectStop(stop, route)}
                    className="mt-2 w-full bg-slate-900 text-white text-[11px] py-1 px-2 rounded font-medium"
                  >
                    Select This Stop
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })
      )}
    </MapContainer>
  );
}