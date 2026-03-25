"use client";

import { Member, Visit } from "@/lib/types";
import { pubs } from "@/lib/pubs";

interface LeaderboardProps {
  members: Member[];
  visits: Visit[];
}

export default function Leaderboard({ members, visits }: LeaderboardProps) {
  const total = pubs.length;

  // Calculate visit counts per member, sorted descending
  const standings = members
    .map((member) => ({
      ...member,
      count: visits.filter((v) => v.personId === member.id).length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="leaderboard">
      <h3 className="mb-3 text-[0.9rem] font-bold text-amber-light">
        🏅 Leaderboard
      </h3>

      <div className="space-y-1.5">
        {standings.map((member, index) => {
          const percentage = Math.round((member.count / total) * 100);
          // Medal for top 3
          const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

          return (
            <div
              key={member.id}
              className="flex items-center gap-2.5 rounded-lg bg-card/50 px-3 py-2 transition-colors hover:bg-card"
            >
              {/* Position */}
              <span className="w-6 text-center text-[0.8rem]">
                {medal || `${index + 1}.`}
              </span>

              {/* Avatar */}
              <span className="text-base">{member.emoji}</span>

              {/* Name */}
              <span className="flex-1 text-[0.85rem] font-semibold text-primary">
                {member.name}
              </span>

              {/* Mini progress bar */}
              <div className="hidden sm:block w-20 h-2 rounded-full bg-dark overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber/60 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Count */}
              <span className="text-[0.82rem] font-bold text-amber">
                {member.count}/{total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
