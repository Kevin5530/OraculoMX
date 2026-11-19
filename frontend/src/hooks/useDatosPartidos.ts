import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { obtenerTablaGeneral, obtenerDescanso, obtenerHistorial, obtenerRacha, obtenerEquipos, predecirPartido } from "@/api/partidos";
import type { PredictionRequest } from "@/types";

// Los catálogos se conservan cinco minutos para evitar consultas repetidas a la API.
export const useEquipos = () =>
  useQuery({ queryKey: ["teams"], queryFn: obtenerEquipos, staleTime: 5 * 60_000 });

export const useTablaGeneral = () =>
  useQuery({
    queryKey: ["standings"],
    queryFn: ({ signal }) => obtenerTablaGeneral(signal),
    staleTime: 5 * 60_000,
  });

export const usePrediccion = () => useMutation({ mutationFn: predecirPartido });

export function useEstadisticasPartido(request: PredictionRequest | undefined) {
  const match = request;

  // Cada consulta tiene su propio error y AbortSignal. Al cambiar de partido,
  // TanStack Query puede cancelar las solicitudes anteriores sin afectar las demás.
  const fatigue = useQuery({
    queryKey: ["match-fatigue", match],
    queryFn: match ? ({ signal }) => obtenerDescanso(match, signal) : skipToken,
    retry: false,
  });
  const h2h = useQuery({
    queryKey: ["match-h2h", match],
    queryFn: match ? ({ signal }) => obtenerHistorial(match, signal) : skipToken,
    retry: false,
  });
  const streak = useQuery({
    queryKey: ["match-streak", match],
    queryFn: match ? ({ signal }) => obtenerRacha(match, signal) : skipToken,
    retry: false,
  });

  return { fatigue, h2h, streak };
}
