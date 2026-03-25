"use client";

import { useState } from "react";
import { Member } from "@/lib/types";

interface PersonSelectorProps {
  members: Member[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddGuest: (name: string) => void;
  onRemoveGuest: (id: string) => void;
}

export default function PersonSelector({
  members,
  selectedId,
  onSelect,
  onAddGuest,
  onRemoveGuest,
}: PersonSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [guestName, setGuestName] = useState("");

  function handleAdd() {
    const trimmed = guestName.trim();
    if (trimmed.length === 0) return;
    onAddGuest(trimmed);
    setGuestName("");
    setShowAddForm(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setShowAddForm(false);
      setGuestName("");
    }
  }

  const coreMembers = members.filter((m) => m.isCore);
  const guests = members.filter((m) => !m.isCore);

  return (
    <div className="person-selector">
      <div className="mb-2 text-[0.75rem] font-semibold uppercase tracking-wider text-muted">
        Who&apos;s drinking?
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Core members */}
        {coreMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member.id)}
            className={`person-pill ${selectedId === member.id ? "active" : ""}`}
          >
            <span className="text-base">{member.emoji}</span>
            <span>{member.name}</span>
          </button>
        ))}

        {/* Divider between core and guests */}
        {guests.length > 0 && (
          <div className="mx-1 h-6 w-px bg-amber/20" />
        )}

        {/* Guest members */}
        {guests.map((member) => (
          <div key={member.id} className="group relative">
            <button
              onClick={() => onSelect(member.id)}
              className={`person-pill guest ${selectedId === member.id ? "active" : ""}`}
            >
              <span className="text-base">{member.emoji}</span>
              <span>{member.name}</span>
            </button>
            {/* Remove button — appears on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveGuest(member.id);
              }}
              className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[0.65rem] font-bold text-white shadow-lg transition-all hover:bg-red-400 group-hover:flex"
              title={`Remove ${member.name}`}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add guest button / form */}
        {showAddForm ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Name..."
              autoFocus
              maxLength={20}
              className="h-8 w-28 rounded-lg border border-amber/30 bg-dark px-2.5 text-[0.82rem] text-primary placeholder-muted outline-none focus:border-amber"
            />
            <button
              onClick={handleAdd}
              className="flex h-8 items-center rounded-lg bg-amber/20 px-2.5 text-[0.82rem] font-semibold text-amber transition-colors hover:bg-amber/30"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setGuestName("");
              }}
              className="flex h-8 items-center rounded-lg px-2 text-[0.82rem] text-muted transition-colors hover:text-primary"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="person-pill add-guest"
            title="Add a guest"
          >
            <span className="text-base">➕</span>
            <span>Guest</span>
          </button>
        )}
      </div>
    </div>
  );
}
