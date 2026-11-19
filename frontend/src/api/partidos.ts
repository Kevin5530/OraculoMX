import axios from "axios";
import { apiClient } from "./cliente";
import { obtenerEscudoEquipo } from "@/lib/escudosEquipos";
import type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  Fatigue,
  HeadToHead,
  MatchResult,
  PredictionRequest,
  PredictionResponse,
  StandingRow,
  Standings,
  Team,
  TeamForm,
} from "@/types";
// El frontend conserva sus tipos internos y traduce los nombres exigidos por la API.
function matchBody(request: PredictionRequest) {
  return { Home: request.homeTeamId, Away: request.awayTeamId };
}

export async function obtenerEquipos(): Promise<Team[]> {
  const { data } = await apiClient.get<{ equipos: string[] }>("/teams");
  if (!Array.isArray(data?.equipos) || !data.equipos.every((name) => typeof name === "string" && name.trim())) {
    throw new Error("La API devolvió un catálogo de equipos inválido.");
  }

  // El servidor usa el nombre exacto como identificador.
  return [...new Set(data.equipos)]
    .filter((name) => name.trim().toLowerCase() !== "guadalajara")
    .map((name) => ({ id: name, name, crestUrl: obtenerEscudoEquipo(name) }));
}

interface ApiStanding {
  team: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface TableFilters {
  season?: string;
  tournament?: string;
}

// Conserva temporada y torneo para indicar el alcance de las posiciones mostradas.
export async function obtenerTablaGeneral(
  filters?: TableFilters,
  signal?: AbortSignal,
): Promise<Standings> {
  const params: Record<string, string> = {};
  if (filters?.season?.trim()) params.season = filters.season.trim();
  if (filters?.tournament?.trim()) params.tournament = filters.tournament.trim();

  const { data } = await apiClient.get<{
    season: string;
    tournament: string;
    standings: ApiStanding[];
  }>("/stats/table", { params, signal });

  if (typeof data?.season !== "string" || typeof data.tournament !== "string" ||
      !Array.isArray(data.standings)) {
    throw new Error("La API devolvió una tabla general con formato inesperado.");
  }

  const rows: StandingRow[] = data.standings.map((row) => {
    const counts = [row?.played, row?.won, row?.drawn, row?.lost, row?.goals_for, row?.goals_against, row?.points];
    if (typeof row?.team !== "string" || !row.team.trim() ||
        !Number.isInteger(row.position) || row.position < 1 ||
        !Number.isInteger(row.goal_difference) ||
        !counts.every((value) => Number.isInteger(value) && value >= 0)) {
      throw new Error("La API devolvió una fila inválida en la tabla general.");
    }
    return {
      teamId: row.team,
      teamName: row.team,
      crestUrl: obtenerEscudoEquipo(row.team),
      position: row.position,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goals_for,
      goalsAgainst: row.goals_against,
      goalDiff: row.goal_difference,
      points: row.points,
    };
  });

  if (new Set(rows.map((row) => row.teamId)).size !== rows.length) {
    throw new Error("La API devolvió equipos repetidos en la tabla general.");
  }
  const hasChivas = rows.some((row) => row.teamName.trim().toLowerCase() === "guadalajara chivas");
  // La API puede enviar al mismo club también con el nombre corto.
  const visibleRows = rows.filter((row) =>
    !hasChivas || row.teamName.trim().toLowerCase() !== "guadalajara"
  ).sort((a, b) => a.position - b.position);
  const standingsRows = visibleRows.length < rows.length
    ? visibleRows.map((row, index) => ({ ...row, position: index + 1 }))
    : visibleRows;

  return { season: data.season, tournament: data.tournament, rows: standingsRows };
}

export async function predecirPartido(request: PredictionRequest): Promise<PredictionResponse> {
  if (!request.homeTeamId || !request.awayTeamId || request.homeTeamId === request.awayTeamId) {
    throw new Error("Selecciona dos equipos distintos.");
  }

  const { data } = await apiClient.post<{
    prediction: string;
    confidence_percentage: number;
    probabilities?: { home_win: number; draw: number; away_win: number };
  }>(
    "/predict", matchBody(request),
  );

  if (typeof data?.prediction !== "string" || !data.prediction.trim() ||
      !Number.isFinite(data.confidence_percentage) ||
      data.confidence_percentage < 0 || data.confidence_percentage > 100) {
    throw new Error("La API devolvió una predicción con formato inesperado.");
  }

  const result: PredictionResponse = { code: data.prediction, confidence: data.confidence_percentage };
  if (data.probabilities === undefined) return result;

  // Los porcentajes llegan en escala 0–100. Se tolera el redondeo a dos decimales.
  const { home_win: home, draw, away_win: away } = data.probabilities ?? {};
  if (
    typeof home !== "number" || typeof draw !== "number" || typeof away !== "number" ||
    ![home, draw, away].every((value) => Number.isFinite(value) && value >= 0 && value <= 100) ||
    Math.abs(home + draw + away - 100) > 0.02
  ) {
    throw new Error("La API devolvió probabilidades con formato inesperado.");
  }

  return { ...result, model: { home, draw, away } };
}

export async function obtenerDescanso(request: PredictionRequest, signal?: AbortSignal): Promise<Fatigue> {
  const { data } = await apiClient.post<{ dias_descanso_local: number; dias_descanso_visitante: number }>(
    "/stats/fatigue", matchBody(request), { signal },
  );
  if (!Number.isFinite(data?.dias_descanso_local) || !Number.isFinite(data?.dias_descanso_visitante)) {
    throw new Error("La API devolvió días de descanso inválidos.");
  }
  return { homeRestDays: data.dias_descanso_local, awayRestDays: data.dias_descanso_visitante };
}

export async function obtenerHistorial(request: PredictionRequest, signal?: AbortSignal): Promise<HeadToHead> {
  const { data } = await apiClient.post<{ victorias_local: number; empates: number; victorias_visitante: number }>(
    "/stats/h2h", matchBody(request), { signal },
  );
  const counts = [data?.victorias_local, data?.empates, data?.victorias_visitante];
  if (!counts.every((count) => Number.isInteger(count) && count >= 0)) {
    throw new Error("La API devolvió un historial directo inválido.");
  }
  return { homeWins: data.victorias_local, draws: data.empates, awayWins: data.victorias_visitante };
}

interface ApiStreak {
  racha_resultados: MatchResult[];
  promedio_gf: number;
  promedio_gc: number;
}

function readStreak(data: ApiStreak | undefined): TeamForm {
  if (!Array.isArray(data?.racha_resultados) ||
      !data.racha_resultados.every((result) => result === "G" || result === "E" || result === "P") ||
      !Number.isFinite(data.promedio_gf) || !Number.isFinite(data.promedio_gc)) {
    throw new Error("La API devolvió una racha con formato inesperado.");
  }
  return { results: data.racha_resultados, avgGoalsFor: data.promedio_gf, avgGoalsAgainst: data.promedio_gc };
}

export async function obtenerRacha(
  request: PredictionRequest,
  days = 5,
  signal?: AbortSignal,
) {
  const safeDays = Number.isInteger(days) && days > 0 ? days : 5;
  const { data } = await apiClient.post<{ local: ApiStreak; visitante: ApiStreak }>(
    "/stats/streak",
    { ...matchBody(request), days: safeDays },
    { signal },
  );
  return { home: readStreak(data?.local), away: readStreak(data?.visitante) };
}

export async function consultarAnalisisIA(
  request: AIAnalysisRequest,
  signal?: AbortSignal,
): Promise<AIAnalysisResponse> {
  if (!request.home?.trim() || !request.away?.trim() || request.home === request.away) {
    throw new Error("Selecciona dos equipos distintos antes de solicitar el análisis.");
  }

  const { data } = await apiClient.post<AIAnalysisResponse>(
    "/ai/match-analysis",
    {
      ...request,
      action: request.action ?? "summary",
      question: request.question?.trim() ?? "",
    },
    { signal },
  );

  if (
    typeof data?.answer !== "string" ||
    !data.answer.trim() ||
    typeof data?.sections?.pronostico !== "string" ||
    typeof data?.sections?.factores !== "string" ||
    typeof data?.sections?.alcance !== "string"
  ) {
    throw new Error("La API devolvió un análisis de IA con formato inesperado.");
  }

  return data;
}

// Centraliza los errores de red y de formato para mostrar mensajes consistentes.
export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "La API tardó demasiado en responder. Intenta de nuevo.";
    }
    if (!error.response) return "No se pudo conectar con el servidor.";
    if (error.response.status === 422) return "La API rechazó los datos del partido.";
    return `Error del servidor (${error.response.status}).`;
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}
