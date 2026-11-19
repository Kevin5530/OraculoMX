
/** Catálogo: identidad visual de cada equipo */
export interface Team {
  id: string; // Nombre exacto utilizado por la API para identificar al equipo
  name: string; // Nombre oficial
  crestUrl: string; // Ruta del escudo, vacía si no está disponible
}

/** Una fila de la tabla general */
export interface StandingRow {
  position: number;
  teamId: string;
  teamName: string;
  crestUrl: string;
  played: number; // JJ
  won: number; // JG
  drawn: number; // JE
  lost: number; // JP
  goalDiff: number; // DIF
  goalsFor: number; // GF
  goalsAgainst: number; // GC
  points: number; // PTS
}

export interface Standings {
  season: string;
  tournament: string;
  rows: StandingRow[];
}

/** Tres porcentajes que deben sumar 100 */
export interface Probabilities {
  home: number; // Victoria local
  draw: number; // Empate
  away: number; // Victoria visitante
}

/** Días de descanso */
export interface Fatigue {
  homeRestDays: number;
  awayRestDays: number;
}

/** Resultado de un partido: Ganado, Empatado, Perdido */
export type MatchResult = "G" | "E" | "P";

/** Resultados y promedios de goles consultados */
export interface TeamForm {
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  results: MatchResult[]; // Se conserva el orden enviado por la API
}

/** Historial directo (últimos 5 enfrentamientos) */
export interface HeadToHead {
  homeWins: number;
  draws: number;
  awayWins: number;
}

/** Cuerpo de la petición POST */
export interface PredictionRequest {
  homeTeamId: string;
  awayTeamId: string;
}

export interface PredictionResponse {
  code: string;
  confidence: number;
  model?: Probabilities;
}

/** Acciones soportadas por el analista de IA */
export type AIAnalysisAction = "summary" | "executive_brief" | "question" | "model_limits";

/** Origen de la respuesta de IA */
export type AIAnalysisSource = "gemini" | "fallback" | "guardrail";

/** Petición hacia POST /ai/match-analysis */
export interface AIAnalysisRequest {
  home: string;
  away: string;
  prob_local?: number;
  prob_empate?: number;
  prob_visitante?: number;
  descanso_local?: number | string;
  descanso_visitante?: number | string;
  racha_local?: string;
  racha_visitante?: string;
  h2h?: string;
  action?: AIAnalysisAction;
  question?: string;
}

/** Secciones estructuradas de la respuesta */
export interface AIAnalysisSections {
  pronostico: string;
  factores: string;
  alcance: string;
}

/** Respuesta de POST /ai/match-analysis */
export interface AIAnalysisResponse {
  home: string;
  away: string;
  action: AIAnalysisAction;
  cached: boolean;
  source: AIAnalysisSource;
  model_used?: string | null;
  sections: AIAnalysisSections;
  answer: string;
}
