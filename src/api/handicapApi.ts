import { apiGet } from "./client";

export type HandicapHistoryItem = {
  id: number;
  handicap_index: string;
  effective_date: string;
  source: string;
  notes: string;
  old_exact_handicap: string | null;
  new_exact_handicap: string | null;
  playing_handicap_used: number | null;
  gross_score: number | null;
  net_score: number | null;
  target_score: number | null;
  buffer_zone_used: number | null;
  nett_differential: number | null;
  adjustment_value: string | null;
  adjustment_type: "decrease" | "no_change" | "increase" | null;
  is_qualifying: boolean;
  rule_version: string;
  source_round: number | null;
  created_at: string;
};

export async function getHandicapHistory(): Promise<HandicapHistoryItem[]> {
  const data = await apiGet<HandicapHistoryItem[] | { results: HandicapHistoryItem[] }>(
    "/api/handicap-history/"
  );
  return Array.isArray(data) ? data : data.results ?? [];
}