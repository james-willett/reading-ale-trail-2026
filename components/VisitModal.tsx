"use client";

import { useState, useEffect } from "react";
import { Pub } from "@/lib/pubs";
import { CORE_MEMBERS, Attendee } from "@/lib/types";

interface VisitModalProps {
  pub: Pub;
  onSubmit: (pubId: number, date: string, attendees: Attendee[]) => void;
  onClose: () => void;
}

export default function VisitModal({ pub, onSubmit, onClose }: VisitModalProps) {
  // Date defaults to today (YYYY-MM-DD for the input)
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  // Core member checkboxes — all checked by default
  const [checkedCore, setCheckedCore] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      CORE_MEMBERS.forEach((name) => (init[name] = true));
      return init;
    }
  );

  // Guest names added for this visit
  const [guests, setGuests] = useState<string[]>([]);
  const [guestInput, setGuestInput] = useState("");

  // Drink per person (keyed by name)
  const [drinks, setDrinks] = useState<Record<string, string>>({});

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // All selected people (core who are checked + guests)
  const selectedPeople = [
    ...CORE_MEMBERS.filter((name) => checkedCore[name]),
    ...guests,
  ];

  function toggleCore(name: string) {
    setCheckedCore((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function addGuest() {
    const trimmed = guestInput.trim();
    if (trimmed.length === 0) return;
    if (guests.includes(trimmed)) return;
    setGuests((prev) => [...prev, trimmed]);
    setGuestInput("");
  }

  function removeGuest(name: string) {
    setGuests((prev) => prev.filter((g) => g !== name));
    // Clean up their drink entry
    setDrinks((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleGuestKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addGuest();
    }
  }

  function handleSubmit() {
    if (selectedPeople.length === 0) return;

    const attendees: Attendee[] = selectedPeople.map((name) => ({
      name,
      drink: drinks[name]?.trim() || "",
    }));

    onSubmit(pub.id, date, attendees);
  }

  return (
    // Backdrop
    <div className="visit-modal-backdrop" onClick={onClose}>
      {/* Modal content — stop click propagation so clicking inside doesn't close */}
      <div className="visit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-amber/[0.15] px-1.5 py-0.5 text-[0.7rem] font-bold text-amber">
                #{pub.id}
              </span>
              <h2 className="truncate text-lg font-bold text-primary">
                {pub.name}
              </h2>
            </div>
            <p className="text-[0.82rem] text-amber">{pub.area}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-hover hover:text-primary"
          >
            ✕
          </button>
        </div>

        {/* Date picker */}
        <div className="mb-4">
          <label className="modal-label">Date of visit</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="modal-input w-full"
          />
        </div>

        {/* Who was there */}
        <div className="mb-4">
          <label className="modal-label">Who was there?</label>

          {/* Core member checkboxes */}
          <div className="mb-2 flex flex-wrap gap-2">
            {CORE_MEMBERS.map((name) => (
              <button
                key={name}
                onClick={() => toggleCore(name)}
                className={`attendee-chip ${checkedCore[name] ? "selected" : ""}`}
              >
                <span className="text-[0.75rem]">
                  {checkedCore[name] ? "✓" : ""}
                </span>
                {name}
              </button>
            ))}
          </div>

          {/* Guest chips */}
          {guests.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {guests.map((name) => (
                <span key={name} className="attendee-chip selected guest">
                  {name}
                  <button
                    onClick={() => removeGuest(name)}
                    className="ml-1 text-[0.65rem] opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add guest input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={guestInput}
              onChange={(e) => setGuestInput(e.target.value)}
              onKeyDown={handleGuestKeyDown}
              placeholder="Add a guest..."
              maxLength={20}
              className="modal-input flex-1"
            />
            <button
              onClick={addGuest}
              disabled={guestInput.trim().length === 0}
              className="rounded-lg bg-amber/20 px-3 text-[0.82rem] font-semibold text-amber transition-colors hover:bg-amber/30 disabled:opacity-40 disabled:hover:bg-amber/20"
            >
              Add
            </button>
          </div>
        </div>

        {/* What each person drank */}
        {selectedPeople.length > 0 && (
          <div className="mb-5">
            <label className="modal-label">What did they drink?</label>
            <div className="space-y-2">
              {selectedPeople.map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 truncate text-[0.82rem] font-semibold text-secondary">
                    {name}
                  </span>
                  <input
                    type="text"
                    value={drinks[name] || ""}
                    onChange={(e) =>
                      setDrinks((prev) => ({ ...prev, [name]: e.target.value }))
                    }
                    placeholder="Beer / cider name..."
                    className="modal-input flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selectedPeople.length === 0}
          className="w-full rounded-xl bg-amber py-3 text-[0.95rem] font-bold text-dark transition-all hover:bg-amber-light hover:shadow-lg disabled:opacity-40 disabled:hover:bg-amber disabled:hover:shadow-none"
        >
          🍺 Check In!
        </button>
      </div>
    </div>
  );
}
