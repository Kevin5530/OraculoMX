import { useEffect, useState } from "react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

import AlertaError from "@/components/ui/AlertaError";
import GraficaProbabilidades from "@/components/ui/GraficaProbabilidades";
import TablaGeneral from "@/components/ui/TablaGeneral";
import SelectorEquipo from "@/components/ui/SelectorEquipo";
import RachaReciente from "@/components/ui/RachaReciente";
import AnalisisIA from "@/components/ui/AnalisisIA";

import { TarjetaDescanso, TarjetaHistorial } from "@/components/ui/EstadisticasPartido";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useAnalisisIA,
  useEstadisticasPartido,
  usePrediccion,
  useTablaGeneral,
  useEquipos,
} from "@/hooks/useDatosPartidos";

import { obtenerMensajeError } from "@/api/partidos";
import type { AIAnalysisRequest } from "@/types";

import "./aplicacion.css";

export default function Aplicacion() {
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [streakDays, setStreakDays] = useState<number>(5);
  const [seasonFilter, setSeasonFilter] = useState<string>("");
  const [tournamentFilter, setTournamentFilter] = useState<string>("");

  const teams = useEquipos();
  const standings = useTablaGeneral({
    season: seasonFilter,
    tournament: tournamentFilter,
  });
  const prediction = usePrediccion();
  const aiAnalysis = useAnalisisIA();
  const stats = useEstadisticasPartido(prediction.variables, streakDays);

  const sameTeam = homeId !== "" && homeId === awayId;
  const canPredict = Boolean(homeId && awayId && !sameTeam);

  const live = prediction.data;
  const form = stats.streak.data;
  const fatigue = stats.fatigue.data;
  const h2h = stats.h2h.data;

  const homeTeam = teams.data?.find((team) => team.id === homeId);
  const awayTeam = teams.data?.find((team) => team.id === awayId);
  const home = homeTeam?.name ?? homeId;
  const away = awayTeam?.name ?? awayId;

  const activeMatch = prediction.variables;
  const activeHomeTeam = teams.data?.find((team) => team.id === activeMatch?.homeTeamId);
  const activeAwayTeam = teams.data?.find((team) => team.id === activeMatch?.awayTeamId);
  const activeHome = activeHomeTeam?.name ?? activeMatch?.homeTeamId ?? "";
  const activeAway = activeAwayTeam?.name ?? activeMatch?.awayTeamId ?? "";

  const verdictText = live?.model
    ? live.model.home >= live.model.draw && live.model.home >= live.model.away
      ? `Ventaja ${activeHome}`
      : live.model.away >= live.model.home && live.model.away >= live.model.draw
        ? `Ventaja ${activeAway}`
        : "Tendencia a Empate"
    : live
      ? `Clase ${live.code}`
      : "Listo para analizar";

  const aiBaseRequest: AIAnalysisRequest | undefined = activeMatch
    ? {
      home: activeHome,
      away: activeAway,
      ...(live?.model
        ? {
          prob_local: live.model.home,
          prob_empate: live.model.draw,
          prob_visitante: live.model.away,
        }
        : {}),
      ...(fatigue
        ? {
          descanso_local: fatigue.homeRestDays,
          descanso_visitante: fatigue.awayRestDays,
        }
        : {}),
      ...(form
        ? {
          racha_local: `${form.home.results.join(", ")} (${form.home.avgGoalsFor} GF, ${form.home.avgGoalsAgainst} GC)`,
          racha_visitante: `${form.away.results.join(", ")} (${form.away.avgGoalsFor} GF, ${form.away.avgGoalsAgainst} GC)`,
        }
        : {}),
      ...(h2h
        ? {
          h2h: `${activeHome} ${h2h.homeWins}, Empates ${h2h.draws}, ${activeAway} ${h2h.awayWins}`,
        }
        : {}),
    }
    : undefined;

  useEffect(() => {
    if (!activeMatch || !live) return;
    aiAnalysis.mutate({
      home: activeHome,
      away: activeAway,
      ...(live.model
        ? {
          prob_local: live.model.home,
          prob_empate: live.model.draw,
          prob_visitante: live.model.away,
        }
        : {}),
      action: "summary",
      question: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatch, live]);

  function selectTeam(side: "home" | "away", id: string) {
    if (side === "home") {
      setHomeId(id);
    } else {
      setAwayId(id);
    }
    prediction.reset();
    aiAnalysis.reset();
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>
            <span>Oráculo</span>MX
          </h1>
          <p>Motor predictivo y analista contextual de Liga MX</p>
        </div>

        <div className="header-pill" aria-label="Estado del sistema">
          <span className="header-pill-dot" aria-hidden="true" />
          <span>Modelo ML + IA Activos</span>
        </div>
      </header>

      {teams.isError && (
        <AlertaError
          title="No se pudo cargar el catálogo"
          message={obtenerMensajeError(teams.error)}
        />
      )}

      <form
        className="team-picker dashboard-panel"
        onSubmit={(event) => {
          event.preventDefault();
          if (canPredict && !prediction.isPending) {
            aiAnalysis.reset();
            prediction.mutate({
              homeTeamId: homeId,
              awayTeamId: awayId,
            });
          }
        }}
      >
        {teams.isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <SelectorEquipo
            label="Equipo Local"
            teams={teams.data ?? []}
            value={homeId}
            onChange={(id) => selectTeam("home", id)}
            disabledId={awayId}
            disabled={prediction.isPending}
          />
        )}

        <span className="versus" aria-hidden="true">
          VS
        </span>

        {teams.isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <SelectorEquipo
            label="Equipo Visitante"
            teams={teams.data ?? []}
            value={awayId}
            onChange={(id) => selectTeam("away", id)}
            disabledId={homeId}
            disabled={prediction.isPending}
          />
        )}

        <button
          className="calculate-button"
          type="submit"
          disabled={!canPredict || prediction.isPending}
        >
          {prediction.isPending ? "Calculando…" : "Calcular"}
        </button>
      </form>

      {sameTeam && (
        <AlertaError
          title="Selección inválida"
          message="El equipo local y el visitante no pueden ser el mismo."
        />
      )}

      {prediction.isError && (
        <AlertaError
          title="Error al generar la predicción"
          message={obtenerMensajeError(prediction.error)}
        />
      )}

      {activeMatch && (
        <section className="dashboard-panel matchup-hero" aria-label="Resumen del enfrentamiento">
          <div className="matchup-team">
            {activeHomeTeam?.crestUrl && (
              <img className="matchup-crest" src={activeHomeTeam.crestUrl} alt="" />
            )}
            <div>
              <span className="matchup-role">Local</span>
              <strong className="matchup-name">{activeHome}</strong>
            </div>
          </div>

          <div className="matchup-verdict">
            <span className="matchup-verdict-label">Lectura del modelo</span>
            <strong>{verdictText}</strong>
          </div>

          <div className="matchup-team is-away">
            <div>
              <span className="matchup-role">Visitante</span>
              <strong className="matchup-name">{activeAway}</strong>
            </div>
            {activeAwayTeam?.crestUrl && (
              <img className="matchup-crest" src={activeAwayTeam.crestUrl} alt="" />
            )}
          </div>
        </section>
      )}

      <div aria-live="polite">
        <section className="prediction-layout" aria-label="Análisis del partido">
          {live?.model ? (
            <GraficaProbabilidades model={live.model} />
          ) : (
            <section className="dashboard-panel probability-panel" aria-labelledby="live-result-title">
              <h2 id="live-result-title">Probabilidad de Resultado</h2>
              {prediction.isPending ? (
                <p className="empty-message mt-6" role="status">Consultando predicción…</p>
              ) : live ? (
                <div className="mt-8 space-y-4">
                  <p className="text-sm text-muted-foreground">{home} vs {away}</p>
                  <p>Clase del modelo: <strong>{live.code}</strong></p>
                  <p className="text-sm text-muted-foreground">Confianza reportada por la API</p>
                  <p className="text-4xl font-bold text-emerald-400">
                    {new Intl.NumberFormat("es-MX", { style: "percent", maximumFractionDigits: 2 }).format(live.confidence / 100)}
                  </p>
                </div>
              ) : !prediction.isError && (
                <p className="empty-message mt-6">
                  Selecciona un equipo local y uno visitante y pulsa <strong>Calcular</strong> para estimar probabilidades.
                </p>
              )}
            </section>
          )}

          <section className="dashboard-panel features-panel" aria-labelledby="features-title">
            <h2 id="features-title">
              <ChartNoAxesColumnIncreasing size={20} aria-hidden="true" />
              Contexto Estadístico del Cruce
            </h2>

            <div className="features-toolbar">
              <p className="form-caption">Racha reciente (Últimos {streakDays} partidos)</p>
              <label className="inline-filter">
                <span>Ventana:</span>
                <select
                  value={streakDays}
                  onChange={(e) => setStreakDays(Number(e.target.value))}
                  disabled={stats.streak.isFetching}
                >
                  <option value={3}>3 partidos</option>
                  <option value={5}>5 partidos</option>
                  <option value={8}>8 partidos</option>
                  <option value={10}>10 partidos</option>
                </select>
              </label>
            </div>

            {form ? (
              <RachaReciente form={form} home={activeHome} away={activeAway} />
            ) : stats.streak.isLoading ? (
              <p className="empty-message" role="status">Cargando rachas…</p>
            ) : stats.streak.isError ? (
              <AlertaError title="No se pudieron cargar las rachas" message={obtenerMensajeError(stats.streak.error)} />
            ) : (
              <p className="empty-message">
                Aquí verás la forma reciente, promedios de gol, descanso y antecedentes directos al calcular un partido.
              </p>
            )}

            {prediction.variables && (
              <div className="extra-grid">
                {fatigue && <TarjetaDescanso fatigue={fatigue} home={activeHome} away={activeAway} />}
                {stats.fatigue.isLoading && <p className="empty-message" role="status">Cargando descanso…</p>}
                {stats.fatigue.isError && <AlertaError title="Descanso no disponible" message={obtenerMensajeError(stats.fatigue.error)} />}
                {h2h && <TarjetaHistorial h2h={h2h} home={activeHome} away={activeAway} />}
                {stats.h2h.isLoading && <p className="empty-message" role="status">Cargando historial directo…</p>}
                {stats.h2h.isError && <AlertaError title="Historial directo no disponible" message={obtenerMensajeError(stats.h2h.error)} />}
              </div>
            )}
          </section>
        </section>
      </div>

      {aiBaseRequest && (
        <AnalisisIA
          request={aiBaseRequest}
          analysis={aiAnalysis.data}
          isLoading={aiAnalysis.isPending}
          isError={aiAnalysis.isError}
          error={aiAnalysis.error}
          onAsk={(payload) => aiAnalysis.mutate(payload)}
        />
      )}

      <section className="mt-8" aria-label="Tabla general" aria-busy={standings.isFetching}>
        <div className="table-section-header">
          <div className="table-filters">
            {!standings.seasonValidation.isValid && standings.seasonValidation.message && (
              <p className="season-validation-hint" role="alert">
                {standings.seasonValidation.message}
              </p>
            )}
            <label className="inline-filter">
              <span>Temporada:</span>
              <input
                type="text"
                list="seasons-datalist"
                className="filter-input"
                placeholder="Más reciente (ej. 2025/2026)"
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
              />
              <datalist id="seasons-datalist">
                <option value="2026/2027" />
                <option value="2025/2026" />
                <option value="2024/2025" />
                <option value="2023/2024" />
                <option value="2022/2023" />
                <option value="2021/2022" />
              </datalist>
            </label>

            <label className="inline-filter">
              <span>Torneo:</span>
              <select
                value={tournamentFilter}
                onChange={(e) => setTournamentFilter(e.target.value)}
              >
                <option value="">Todos / Anual</option>
                <option value="Apertura">Apertura</option>
                <option value="Clausura">Clausura</option>
              </select>
            </label>

            {seasonFilter && (
              <button
                type="button"
                className="ai-suggestion-pill"
                onClick={() => setSeasonFilter("")}
              >
                Usar actual
              </button>
            )}
          </div>

          {standings.isFetching && (
            <span className="empty-message" role="status">
              Actualizando tabla…
            </span>
          )}
        </div>

        {standings.isLoading && (
          <div role="status">
            <span className="sr-only">Cargando tabla general…</span>
            <Skeleton className="h-48 w-full" />
          </div>
        )}
        {standings.isError && (
          <div className="space-y-3">
            <AlertaError title="No se pudo actualizar la tabla" message={obtenerMensajeError(standings.error)} />
            <button
              className="calculate-button"
              type="button"
              disabled={standings.isFetching}
              onClick={() => void standings.refetch()}
            >
              {standings.isFetching ? "Cargando…" : "Reintentar"}
            </button>
          </div>
        )}
        {standings.data && (
          <div className="table-scroll-wrapper">
            <TablaGeneral
              rows={standings.data.rows}
              highlight={[homeId, awayId]}
              season={standings.data.season}
              tournament={standings.data.tournament}
            />
          </div>
        )}
      </section>
    </main>
  );
}