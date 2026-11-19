import { useState } from "react";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

import AlertaError from "@/components/ui/AlertaError";
import GraficaProbabilidades from "@/components/ui/GraficaProbabilidades";
import TablaGeneral from "@/components/ui/TablaGeneral";
import SelectorEquipo from "@/components/ui/SelectorEquipo";
import RachaReciente from "@/components/ui/RachaReciente";

import { TarjetaDescanso, TarjetaHistorial } from "@/components/ui/EstadisticasPartido";
import { Skeleton } from "@/components/ui/skeleton";

import { useEstadisticasPartido, usePrediccion, useTablaGeneral, useEquipos } from "@/hooks/useDatosPartidos";

import { obtenerMensajeError } from "@/api/partidos";

import "./aplicacion.css";

export default function Aplicacion() {
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");

  const teams = useEquipos();
  const standings = useTablaGeneral();
  const prediction = usePrediccion();
  // Las estadísticas usan el último partido enviado, no una selección sin calcular.
  const stats = useEstadisticasPartido(prediction.variables);

  const sameTeam = homeId !== "" && homeId === awayId;

  const canPredict = Boolean(homeId && awayId && !sameTeam);

  const live = prediction.data;
  const form = stats.streak.data;
  const fatigue = stats.fatigue.data;
  const h2h = stats.h2h.data;
  const home = teams.data?.find((team) => team.id === homeId)?.name ?? homeId;
  const away = teams.data?.find((team) => team.id === awayId)?.name ?? awayId;

  function selectTeam(side: "home" | "away", id: string) {
    if (side === "home") {
      setHomeId(id);
    } else {
      setAwayId(id);
    }

    // Limpia el resultado anterior al cambiar de equipo.
    prediction.reset();
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>
            <span>Oráculo</span>MX
          </h1>

          <p>Dashboard</p>
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

      <div aria-live="polite">
        <section
          className="prediction-layout"
          aria-label="Análisis del partido"
        >
          {live?.model ? (
            <GraficaProbabilidades model={live.model} />
          ) : (
            <section className="dashboard-panel probability-panel" aria-labelledby="live-result-title">
              <h2 id="live-result-title">Resultado del modelo</h2>
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
                <p className="empty-message mt-6">Selecciona dos equipos y pulsa Calcular.</p>
              )}
            </section>
          )}

          <section
            className="dashboard-panel features-panel"
            aria-labelledby="features-title"
          >
            <h2 id="features-title">
              <ChartNoAxesColumnIncreasing size={21} aria-hidden="true" />
              Desglose de Características
            </h2>

            <p className="form-caption">Resumen (Últimos 5 partidos)</p>

            {form ? (
              <RachaReciente form={form} home={home} away={away} />
            ) : stats.streak.isLoading ? (
              <p className="empty-message" role="status">Cargando rachas…</p>
            ) : stats.streak.isError ? (
              <AlertaError title="No se pudieron cargar las rachas" message={obtenerMensajeError(stats.streak.error)} />
            ) : (
              <p className="empty-message">
                Selecciona dos equipos y pulsa Calcular para consultar sus
                rachas.
              </p>
            )}
          </section>
        </section>
      </div>

      {prediction.variables && <details className="extra-analysis">
        <summary>Ver descanso e historial directo</summary>

        <div className="extra-content">
          <div className="extra-grid">
            {fatigue && <TarjetaDescanso fatigue={fatigue} home={home} away={away} />}
            {stats.fatigue.isLoading && <p role="status">Cargando días de descanso…</p>}
            {stats.fatigue.isError && <AlertaError title="Descanso no disponible" message={obtenerMensajeError(stats.fatigue.error)} />}
            {h2h && <TarjetaHistorial h2h={h2h} home={home} away={away} />}
            {stats.h2h.isLoading && <p role="status">Cargando historial directo…</p>}
            {stats.h2h.isError && <AlertaError title="Historial directo no disponible" message={obtenerMensajeError(stats.h2h.error)} />}
          </div>

        </div>
      </details>}

      <section className="mt-8" aria-label="Tabla general" aria-busy={standings.isFetching}>
        {standings.isLoading && (
          <div role="status">
            <span className="sr-only">Cargando tabla general…</span>
            <Skeleton className="h-48 w-full" />
          </div>
        )}
        {standings.isError && (
          <div className="space-y-3">
            <AlertaError title="No se pudo actualizar la tabla" message={obtenerMensajeError(standings.error)} />
            <button className="calculate-button" type="button" disabled={standings.isFetching}
              onClick={() => void standings.refetch()}>
              {standings.isFetching ? "Cargando…" : "Reintentar"}
            </button>
          </div>
        )}
        {standings.data && (
          <TablaGeneral rows={standings.data.rows} highlight={[homeId, awayId]}
            season={standings.data.season} tournament={standings.data.tournament} />
        )}
      </section>
    </main>
  );
}
