// src/types/round.ts
export type RoundStatus = "draft" | "in_progress" | "completed" | "cancelled";

export type ScoringFormat = "stableford" | "strokeplay" | string;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RoundListApiItem {
  id: number;
  name: string;
  date_played: string;
  status: RoundStatus;
  scoring_format: ScoringFormat;
  course?: {
    name?: string;
    tee_set_name?: string;
  };
  course_name_snapshot?: string;
  tee_set_name_snapshot?: string;
  summary?: {
    players_count?: number;
    holes_completed?: number;
    completion_percent?: number;
    total_holes?: number;
  };
  players_count?: number;
  holes_completed?: number;
  completion_percent?: number;
  total_holes?: number;
  timestamps?: {
    created_at?: string;
    updated_at?: string;
    started_at?: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
  };
}

export interface RoundListItem {
  id: number;
  name: string;
  date_played: string;
  status: RoundStatus;
  scoring_format: ScoringFormat;
  course_name_snapshot: string;
  tee_set_name_snapshot: string;
  players_count: number;
  holes_completed: number;
  completion_percent: number;
  total_holes: number;
}

export interface RoundCourseDetail {
  id: number;
  name: string;
  club_name?: string | null;
  tee_set_id: number;
  tee_set_name: string;
  tee_set_colour?: string | null;
  course_par_total?: number | null;
  tee_par_total?: number | null;
  course_rating?: number | null;
  slope_rating?: number | null;
  sss_value?: number | null;
  holes_count?: number | null;
}

export interface RoundSummary {
  players_count: number;
  holes_completed: number;
  completion_percent: number;
  total_holes: number;
}

export interface RoundLeaderboardPlayer {
  id: number;
  display_name: string;
  position?: number | null;
  gross_total?: number | null;
  net_total?: number | null;
  stableford_total?: number | null;
}

export interface RoundLeaderboard {
  metric: string;
  leader_name?: string | null;
  leader_value?: number | null;
  tied_leaders?: string[];
  players: RoundLeaderboardPlayer[];
}

export interface RoundPlayerTotals {
  gross?: number | null;
  net?: number | null;
  stableford?: number | null;
}

export interface RoundPlayer {
  id: number;
  display_name: string;
  player_order: number;
  position?: number | null;
  is_primary_player?: boolean;
  handicap_index?: number | null;
  course_handicap?: number | null;
  playing_handicap?: number | null;
  totals?: RoundPlayerTotals | null;
}

export interface RoundHoleScore {
  round_hole_score_id: number;
  round_player_id: number;
  player_name: string;
  player_order: number;
  handicap_strokes_received?: number | null;
  strokes?: number | null;
  adjusted_strokes?: number | null;
  gross_to_par?: number | null;
  net_strokes?: number | null;
  net_to_par?: number | null;
  stableford_points?: number | null;
  is_complete: boolean;
  notes?: string;
}

export interface RoundHole {
  number: number;
  yardage?: number | null;
  par?: number | null;
  stroke_index?: number | null;
  scores: RoundHoleScore[];
}

export interface RoundTimestamps {
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
}

export interface RoundDetail {
  id: number;
  name: string;
  date_played: string;
  status: RoundStatus;
  scoring_format: ScoringFormat;
  notes?: string;
  course: RoundCourseDetail;
  summary: RoundSummary;
  leaderboard: RoundLeaderboard;
  players: RoundPlayer[];
  holes: RoundHole[];
  timestamps: RoundTimestamps;
}

export interface CreateRoundPlayerInput {
  display_name: string;
}

export interface CreateRoundPayload {
  name: string;
  course_id: number;
  tee_set_id: number;
  scoring_format: string;
  date_played: string;
  players: CreateRoundPlayerInput[];
}

export interface PatchHoleScorePayload {
  strokes?: number | null;
  points?: number | null;
}