import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Fatigue, HeadToHead } from "@/types";

export function TarjetaDescanso({
  fatigue,
  home,
  away,
}: {
  fatigue: Fatigue;
  home: string;
  away: string;
}) {
  const maxDays = Math.max(fatigue.homeRestDays, fatigue.awayRestDays, 1);
  const homePct = Math.min(100, Math.round((fatigue.homeRestDays / maxDays) * 100));
  const awayPct = Math.min(100, Math.round((fatigue.awayRestDays / maxDays) * 100));

  return (
    <Card className="border-slate-700 bg-slate-900/90">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-slate-200">
          Recuperación y Descanso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>{home}</span>
            <strong>{fatigue.homeRestDays} días</strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${homePct}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>{away}</span>
            <strong>{fatigue.awayRestDays} días</strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-indigo-400" style={{ width: `${awayPct}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TarjetaHistorial({
  h2h,
  home,
  away,
}: {
  h2h: HeadToHead;
  home: string;
  away: string;
}) {
  const total = h2h.homeWins + h2h.draws + h2h.awayWins || 1;
  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <Card className="border-slate-700 bg-slate-900/90">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-slate-200">
          Historial Directo (H2H)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="bg-emerald-500" style={{ width: pct(h2h.homeWins) }} />
          <div className="bg-amber-400" style={{ width: pct(h2h.draws) }} />
          <div className="bg-rose-500" style={{ width: pct(h2h.awayWins) }} />
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-slate-300">
          <span>{home}: <strong>{h2h.homeWins}</strong></span>
          <span>Empates: <strong>{h2h.draws}</strong></span>
          <span>{away}: <strong>{h2h.awayWins}</strong></span>
        </div>
      </CardContent>
    </Card>
  );
}