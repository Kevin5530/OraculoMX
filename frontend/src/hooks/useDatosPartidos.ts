import { useEffect, useState } from "react";
import { keepPreviousData, skipToken, useMutation, useQuery } from "@tanstack/react-query";
import {
  consultarAnalisisIA,
  obtenerTablaGeneral,
  obtenerDescanso,
  obtenerHistorial,
  obtenerRacha,
  obtenerEquipos,
  predecirPartido,
} from "@/api/partidos";
import type { AIAnalysisRequest, PredictionRequest } from "@/types";

const SEASON_REGEX = /^(\d{4})\/(\d{4})$/;

export function validarTemporada(rawSeason: string): {
  isEmpty: boolean;
  isValid: boolean;
  normalized: string;
  message?: string;
} {
  const trimmed = rawSeason.trim();
  if (!trimmed) {
    return { isEmpty: true, isValid: true, normalized: "" };
  }

  const match = SEASON_REGEX.exec(trimmed);
  if (!match) {
    return {
      isEmpty: false,
      isValid: false,
      normalized: trimmed,
      message: "Usa el formato AAAA/AAAA (ej. 2025/2026) o deja vacío para la actual.",
    };
  }

  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  if (endYear < startYear || endYear - startYear > 1) {
    return {
      isEmpty: false,
      isValid: false,
      normalized: trimmed,
      message: "Revisa los años de la temporada (ej. 2025/2026).",
    };
  }

  return { isEmpty: false, isValid: true, normalized: trimmed };
}

export const useEquipos = () =>
  useQuery({ queryKey: ["teams"], queryFn: obtenerEquipos, staleTime: 5 * 60_000 });

export const useTablaGeneral = (filters?: { season?: string; tournament?: string }) => {
  const rawSeason = filters?.season ?? "";
  const tournament = filters?.tournament ?? "";
  const validation = validarTemporada(rawSeason);
  const [debouncedSeason, setDebouncedSeason] = useState(validation.isValid ? validation.normalized : "");

  useEffect(() => {
    if (!validation.isValid) return;
    const timer = window.setTimeout(() => {
      setDebouncedSeason(validation.normalized);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [validation.isValid, validation.normalized]);

  const effectiveSeason = validation.isEmpty ? "" : debouncedSeason;
  const shouldFetch = validation.isEmpty || (validation.isValid && effectiveSeason === validation.normalized);

  const query = useQuery({
    queryKey: ["standings", effectiveSeason, tournament],
    queryFn: ({ signal }) =>
      obtenerTablaGeneral({ season: effectiveSeason || undefined, tournament: tournament || undefined }, signal),
    enabled: shouldFetch,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    seasonValidation: validation,
  };
};

export const usePrediccion = () => useMutation({ mutationFn: predecirPartido });

export const useAnalisisIA = () =>
  useMutation({
    mutationFn: (request: AIAnalysisRequest) => consultarAnalisisIA(request),
  });

export function useEstadisticasPartido(
  request: PredictionRequest | undefined,
  streakDays = 5,
) {
  const match = request;

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
    queryKey: ["match-streak", match, streakDays],
    queryFn: match
      ? ({ signal }) => obtenerRacha(match, streakDays, signal)
      : skipToken,
    retry: false,
  });

  return { fatigue, h2h, streak };
}