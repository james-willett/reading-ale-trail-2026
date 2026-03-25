"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pub } from "@/lib/pubs";

// Custom beer marker icon — unvisited
const beerIcon = L.divIcon({
  html: '<div class="beer-marker">🍺</div>',
  className: "beer-marker-container",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30],
});

// Booklet seller gets a special glowing icon
const bookletIcon = L.divIcon({
  html: '<div class="beer-marker booklet-seller">🍺</div>',
  className: "beer-marker-container",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30],
});

// Visited pub marker — gold checkmark
const visitedIcon = L.divIcon({
  html: '<div class="beer-marker visited-marker">✅</div>',
  className: "beer-marker-container",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30],
});

// Component to fly to a pub when selectedPubId changes
function FlyToMarker({
  pub,
  markerRefs,
}: {
  pub: Pub | null;
  markerRefs: React.MutableRefObject<Record<number, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (pub) {
      map.flyTo([pub.lat, pub.lng], 16, { duration: 1 });
      // Open the popup after flying
      const marker = markerRefs.current[pub.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 500);
      }
    }
  }, [pub, map, markerRefs]);

  return null;
}

interface MapProps {
  pubs: Pub[];
  selectedPub: Pub | null;
  visitedPubIds: Set<number>;
}

export default function AleTrailMap({ pubs, selectedPub, visitedPubIds }: MapProps) {
  const markerRefs = useRef<Record<number, L.Marker>>({});

  // Choose the right icon for each pub
  function getIcon(pub: Pub): L.DivIcon {
    if (visitedPubIds.has(pub.id)) return visitedIcon;
    if (pub.isBookletSeller) return bookletIcon;
    return beerIcon;
  }

  return (
    <MapContainer
      center={[51.4543, -0.9781]}
      zoom={12}
      scrollWheelZoom={true}
      className="h-[60vh] min-h-[350px] w-full z-[1] md:h-[55vh]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {pubs.map((pub) => (
        <Marker
          key={pub.id}
          position={[pub.lat, pub.lng]}
          icon={getIcon(pub)}
          ref={(ref) => {
            if (ref) markerRefs.current[pub.id] = ref;
          }}
        >
          <Popup>
            <div className="pub-popup">
              <h3>{pub.name}</h3>
              <p className="popup-area">{pub.area}</p>
              <p className="popup-address">{pub.address}</p>
              {pub.isBookletSeller && (
                <span className="popup-badge">📖 Sells Booklets</span>
              )}
              {visitedPubIds.has(pub.id) && (
                <span className="popup-badge visited">✅ Visited</span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <FlyToMarker pub={selectedPub} markerRefs={markerRefs} />
    </MapContainer>
  );
}
