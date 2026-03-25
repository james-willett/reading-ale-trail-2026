"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import PubCard from "@/components/PubCard";
import { pubs, Pub } from "@/lib/pubs";

// Leaflet must be client-side only — no SSR
const AleTrailMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);

  function handlePubClick(pub: Pub) {
    setSelectedPub(pub);
  }

  return (
    <>
      <Header />

      {/* Map */}
      <AleTrailMap pubs={pubs} selectedPub={selectedPub} />

      {/* Pub list */}
      <section className="mx-auto max-w-[1200px] px-4 pb-12 pt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[1.4rem] font-bold text-amber-light">
            All 24 Pubs
          </h2>
          <p className="text-[0.85rem] text-muted">
            Click a card to find it on the map
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {pubs.map((pub) => (
            <PubCard
              key={pub.id}
              pub={pub}
              isActive={selectedPub?.id === pub.id}
              onClick={() => handlePubClick(pub)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber/20 px-4 py-6 text-center text-[0.78rem] text-muted">
        <p>
          Reading Ale Trail 2026 &mdash; Organised by{" "}
          <a
            href="https://www.readingcamra.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber hover:underline"
          >
            Reading &amp; Mid-Berkshire CAMRA
          </a>
        </p>
        <p className="mt-1.5">
          Map data &copy;{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber hover:underline"
          >
            OpenStreetMap
          </a>{" "}
          contributors
        </p>
      </footer>
    </>
  );
}
