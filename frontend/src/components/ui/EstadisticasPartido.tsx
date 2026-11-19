import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Fatigue, HeadToHead } from "@/types";

/** Muestra los días de descanso consultados. */
export function TarjetaDescanso({
  fatigue,
  home,
  away,
}: {
  fatigue: Fatigue;
  home: string;
  away: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatiga</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          {home}: <b>{fatigue.homeRestDays}</b> días de descanso
        </p>
        <p>
          {away}: <b>{fatigue.awayRestDays}</b> días de descanso
        </p>
      </CardContent>
    </Card>
  );
}

/** H2H: barra proporcional de los enfrentamientos informados. */
export function TarjetaHistorial({
  h2h,
  home,
  away,
}: {
  h2h: HeadToHead;
  home: string;
  away: string;
}) {
  const total = h2h.homeWins + h2h.draws + h2h.awayWins || 1; // evita dividir entre 0
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial directo (H2H)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex h-4 overflow-hidden rounded">
          <div className="bg-green-600" style={{ width: pct(h2h.homeWins) }} />
          <div className="bg-gray-400" style={{ width: pct(h2h.draws) }} />
          <div className="bg-blue-600" style={{ width: pct(h2h.awayWins) }} />
        </div>
        <p>
          {home}: {h2h.homeWins} · Empates: {h2h.draws} · {away}: {h2h.awayWins}
        </p>
      </CardContent>
    </Card>
  );
}
