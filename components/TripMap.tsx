"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pub } from "@/lib/pubs";

// ── Marker icons (same style as the main map) ──────────────
const beerIcon = L.divIcon({
  html: '<div class="beer-marker">🍺</div>',
  className: "beer-marker-container",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30],
});

const visitedIcon = L.divIcon({
  html: '<div class="beer-marker visited-marker">✅</div>',
  className: "beer-marker-container",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30],
});

// ── Auto-fit the map to show all pubs ──────────────────────
function FitBounds({ pubs }: { pubs: Pub[] }) {
  const map = useMap();

  useEffect(() => {
    if (pubs.length === 0) return;

    if (pubs.length === 1) {
      // Single pub — centre on it at a reasonable zoom
      map.setView([pubs[0].lat, pubs[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(pubs.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [35, 35] });
    }
  }, [pubs, map]);

  return null;
}

// ── Props ──────────────────────────────────────────────────
interface TripMapProps {
  pubs: Pub[];
  visitedPubIds: Set<number>;
  large?: boolean; // false = mini card map, true = expanded detail map
}

export default function TripMap({
  pubs: tripPubs,
  visitedPubIds,
  large = false,
}: TripMapProps) {
  // Route line connecting pubs in order
  const routeCoords: [number, number][] = tripPubs.map((p) => [p.lat, p.lng]);

  // Default centre (overridden by FitBounds immediately)
  const center: [number, number] =
    tripPubs.length > 0
      ? [tripPubs[0].lat, tripPubs[0].lng]
      : [51.4543, -0.9781];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={large}
      dragging={large}
      zoomControl={large}
      attributionControl={false}
      className={large ? "h-[400px] w-full z-[1]" : "h-[180px] w-full z-[1]"}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Dashed amber route line between pubs */}
      {tripPubs.length > 1 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: "#d4a034",
            weight: 3,
            opacity: 0.8,
            dashArray: "8, 8",
          }}
        />
      )}

      {/* Pub markers */}
      {tripPubs.map((pub, idx) => (
        <Marker
          key={pub.id}
          position={[pub.lat, pub.lng]}
          icon={visitedPubIds.has(pub.id) ? visitedIcon : beerIcon}
        >
          {large && (
            <Popup>
              <div className="pub-popup">
                <h3>
                  {idx + 1}. {pub.name}
                </h3>
                <p className="popup-area">{pub.area}</p>
                <p className="popup-address">{pub.address}</p>
                {visitedPubIds.has(pub.id) && (
                  <span className="popup-badge visited">✅ Visited</span>
                )}
              </div>
            </Popup>
          )}
        </Marker>
      ))}

      <FitBounds pubs={tripPubs} />
    </MapContainer>
  );
}
