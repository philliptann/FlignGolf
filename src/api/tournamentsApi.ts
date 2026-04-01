// src/api/tournamentsApi.ts

import { apiGet, apiPostJson } from "./client";

export type CreateTournamentPayload = {
  name: string;
  course_id: number;
  tee_set_id: number;
  scoring_format: "stableford" | "strokeplay" | "matchplay";
  date_played: string;
  is_qualifying?: boolean;
};

export type Tournament = {
  id: number;
  name: string;
  join_code: string;
  date_played: string;
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  scoring_format: "stableford" | "strokeplay" | "matchplay";
  is_qualifying: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateTournamentResponse = {
  tournament: Tournament;
  round_id: number;
};

export type JoinTournamentPayload = {
  join_code: string;
};

export type TournamentLeaderboardRow = {
  user_id: number;
  display_name: string;
  round_id: number;
  round_status: string;
  total_score: number | null;
  total_points: number | null;
  holes_completed: number;
};

export async function createTournament(payload: CreateTournamentPayload) {
  return apiPostJson<CreateTournamentResponse>("/api/tournaments/", payload);
}

export async function joinTournament(payload: JoinTournamentPayload) {
  return apiPostJson<CreateTournamentResponse>("/api/tournaments/join/", payload);
}

export async function getTournamentDetail(tournamentId: number) {
  return apiGet<Tournament>(`/api/tournaments/${tournamentId}/`);
}

export async function getTournamentLeaderboard(tournamentId: number) {
  return apiGet<TournamentLeaderboardRow[]>(
    `/api/tournaments/${tournamentId}/leaderboard/`
  );
}