// src/api/roundsApi.ts
import { apiGet, apiPatchJson, apiPostJson } from "./client";

import {
  CreateRoundPayload,
  PatchHoleScorePayload,
  RoundDetail,
  RoundListApiItem,
  PaginatedResponse,
} from "../types/round";

export interface GetRoundsParams {
  status?: string;
  date_from?: string;
  date_to?: string;
  recent?: boolean;
}

function buildQuery(params?: GetRoundsParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  if (params.status) searchParams.append("status", params.status);
  if (params.date_from) searchParams.append("date_from", params.date_from);
  if (params.date_to) searchParams.append("date_to", params.date_to);
  if (typeof params.recent === "boolean") {
    searchParams.append("recent", String(params.recent));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getRounds(
  params?: GetRoundsParams
): Promise<PaginatedResponse<RoundListApiItem>> {
  return apiGet<PaginatedResponse<RoundListApiItem>>(`/api/rounds/${buildQuery(params)}`);
}

export async function getRoundDetail(roundId: number): Promise<RoundDetail> {
  return apiGet<RoundDetail>(`/api/rounds/${roundId}/`);
}

export async function createRound(payload: CreateRoundPayload): Promise<RoundDetail> {
  return apiPostJson<RoundDetail>("/api/rounds/", payload);
}

export async function patchRoundHoleScore(
  holeScoreId: number,
  payload: PatchHoleScorePayload
) {
  return apiPatchJson(`/api/round-hole-scores/${holeScoreId}/`, payload);
}

export async function startRound(roundId: number) {
  return apiPostJson(`/api/rounds/${roundId}/start/`, {});
}

export async function completeRound(roundId: number) {
  return apiPostJson(`/api/rounds/${roundId}/complete/`, {});
}

export async function cancelRound(roundId: number) {
  return apiPostJson(`/api/rounds/${roundId}/cancel/`, {});
}