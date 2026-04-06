// src/features/rounds/utils/roundMappers.ts
import { RoundDetail, RoundListApiItem, RoundListItem } from "../../../types/round";

export interface PlayScreenHole {
  holeNumber: number;
  yardage: number | null;
  playerScores: {
    holeScoreId: number;
    playerId: number;
    playerName: string;
    strokes: number | null;
    points: number | null;
    par: number | null;
  }[];
}

export interface PlayScreenRound {
  id: number;
  name: string;
  status: RoundDetail["status"];
  datePlayed: string;
  courseName: string;
  teeSetName: string;
  holes: PlayScreenHole[];
  players: {
    id: number;
    name: string;
    totalScore?: number | null;
    totalPoints?: number | null;
  }[];
}

export function mapRoundDetailToPlayScreen(round: RoundDetail): PlayScreenRound {
  const players = (round.players ?? []).map((player) => ({
    id: player.id,
    name: player.display_name,
    totalScore: player.totals?.gross ?? null,
    totalPoints: player.totals?.stableford ?? null,
  }));

  const holes = (round.holes ?? [])
    .map((hole) => ({
      holeNumber: hole.number,
      yardage: hole.yardage ?? null,
      playerScores: (hole.scores ?? []).map((score) => ({
        holeScoreId: score.round_hole_score_id,
        playerId: score.round_player_id,
        playerName: score.player_name,
        strokes: score.strokes ?? null,
        points: score.stableford_points ?? null,
        par: hole.par ?? null,
      })),
    }))
    .sort((a, b) => a.holeNumber - b.holeNumber);

  return {
    id: round.id,
    name: round.name,
    status: round.status,
    datePlayed: round.date_played,
    courseName: round.course?.name ?? "",
    teeSetName: round.course?.tee_set_name ?? "",
    holes,
    players,
  };
}

export function isRoundLocked(status: RoundDetail["status"]): boolean {
  return status === "completed" || status === "cancelled";
}

export function mapRoundListItem(apiItem: RoundListApiItem): RoundListItem {
  return {
    id: apiItem.id,
    name: apiItem.name,
    date_played: apiItem.date_played,
    status: apiItem.status,
    scoring_format: apiItem.scoring_format,
    course_name_snapshot:
      apiItem.course_name_snapshot ?? apiItem.course?.name ?? "",
    tee_set_name_snapshot:
      apiItem.tee_set_name_snapshot ?? apiItem.course?.tee_set_name ?? "",
    players_count:
      apiItem.players_count ?? apiItem.summary?.players_count ?? 0,
    holes_completed:
      apiItem.holes_completed ?? apiItem.summary?.holes_completed ?? 0,
    completion_percent:
      apiItem.completion_percent ?? apiItem.summary?.completion_percent ?? 0,
    total_holes:
      apiItem.total_holes ?? apiItem.summary?.total_holes ?? 0,
  };
}