"use client";

import { useState } from "react";
import { teams } from "../data/teams";

export default function LeaderboardPage() {
  const [selectedPool, setSelectedPool] = useState("pool1");

  const filteredTeams = teams
    .filter((team) => team.poolId === selectedPool)
    .sort((a, b) => b.points - a.points);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setSelectedPool("pool1")}
          className={`px-4 py-2 rounded-lg ${
            selectedPool === "pool1"
              ? "bg-blue-600"
              : "bg-zinc-800"
          }`}
        >
          Pool 1
        </button>

        <button
          onClick={() => setSelectedPool("pool2")}
          className={`px-4 py-2 rounded-lg ${
            selectedPool === "pool2"
              ? "bg-blue-600"
              : "bg-zinc-800"
          }`}
        >
          Pool 2
        </button>
      </div>

      <div className="space-y-2">
        {filteredTeams.map((team, index) => (
          <div
            key={team.id}
            className="flex justify-between p-4 rounded-lg bg-zinc-900"
          >
            <span>
              #{index + 1} {team.name}
            </span>
            <span>{team.points}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
