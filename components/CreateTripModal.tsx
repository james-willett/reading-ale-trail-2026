"use client";

import { useState } from "react";
import { pubs } from "@/lib/pubs";

interface CreateTripModalProps {
  onClose: () => void;
  onCreate: (trip: {
    name: string;
    description: string;
    pubIds: number[];
    plannedDate?: string;
  }) => void;
}

export default function CreateTripModal({
  onClose,
  onCreate,
}: CreateTripModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPubIds, setSelectedPubIds] = useState<Set<number>>(new Set());
  const [plannedDate, setPlannedDate] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Toggle a pub in/out of the selection
  function togglePub(pubId: number) {
    setSelectedPubIds((prev) => {
      const next = new Set(prev);
      if (next.has(pubId)) {
        next.delete(pubId);
      } else {
        next.add(pubId);
      }
      return next;
    });
  }

  // Filter pubs by search term (name or area)
  const filteredPubs = pubs.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.area.toLowerCase().includes(searchFilter.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedPubIds.size === 0) return;

    onCreate({
      name: name.trim(),
      description: description.trim(),
      pubIds: Array.from(selectedPubIds),
      plannedDate: plannedDate || undefined,
    });
  }

  const canSubmit = name.trim().length > 0 && selectedPubIds.size > 0;

  return (
    <div className="visit-modal-backdrop" onClick={onClose}>
      <div
        className="visit-modal max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[1.2rem] font-bold text-primary">
            Create Custom Trip
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-muted transition-colors hover:text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trip name */}
          <div>
            <label htmlFor="trip-name" className="modal-label">
              Trip Name *
            </label>
            <input
              id="trip-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saturday Pub Crawl"
              className="modal-input w-full"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="trip-desc" className="modal-label">
              Description (optional)
            </label>
            <textarea
              id="trip-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any notes about this trip..."
              rows={2}
              className="modal-input w-full resize-none py-2"
            />
          </div>

          {/* Planned date */}
          <div>
            <label htmlFor="trip-date" className="modal-label">
              Planned Date (optional)
            </label>
            <input
              id="trip-date"
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="modal-input w-full"
            />
          </div>

          {/* Pub selection */}
          <div>
            <label className="modal-label">
              Select Pubs * ({selectedPubIds.size} selected)
            </label>

            {/* Search filter */}
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter pubs..."
              className="modal-input mb-2 w-full"
            />

            {/* Scrollable pub list */}
            <div className="create-trip-pub-list max-h-[240px] space-y-1 overflow-y-auto rounded-lg border border-amber/20 bg-dark p-2">
              {filteredPubs.map((pub) => {
                const isSelected = selectedPubIds.has(pub.id);
                return (
                  <label
                    key={pub.id}
                    className={`create-trip-pub-item flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                      isSelected
                        ? "bg-amber/[0.12] text-primary"
                        : "text-secondary hover:bg-card-hover"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePub(pub.id)}
                      className="accent-amber h-4 w-4 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[0.85rem] font-semibold">
                        {pub.name}
                      </span>
                      <span className="ml-1.5 text-[0.72rem] text-muted">
                        {pub.area}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[0.75rem] text-amber">✓</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[0.85rem] font-semibold text-muted transition-colors hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-amber px-5 py-2 text-[0.85rem] font-bold text-dark transition-opacity disabled:opacity-40"
            >
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
