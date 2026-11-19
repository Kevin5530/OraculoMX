import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StandingRow } from "@/types";

interface Props {
  rows: StandingRow[];
  highlight: string[]; // ids de los equipos seleccionados, para resaltarlos
  season?: string;
  tournament?: string;
}

export default function TablaGeneral({ rows, highlight, season, tournament }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla general</CardTitle>
        {(season || tournament) && (
          <p className="text-sm text-muted-foreground">{[season, tournament].filter(Boolean).join(" · ")}</p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <caption className="sr-only">
            Tabla general {[season, tournament].filter(Boolean).join(" · ")}.
            JJ: jugados; JG: ganados; JE: empatados; JP: perdidos; GF: goles a favor; GC: goles en contra; DIF: diferencia de goles; PTS: puntos.
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>JJ</TableHead>
              <TableHead>JG</TableHead>
              <TableHead>JE</TableHead>
              <TableHead>JP</TableHead>
              <TableHead>GF</TableHead>
              <TableHead>GC</TableHead>
              <TableHead>DIF</TableHead>
              <TableHead>PTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No hay posiciones disponibles para esta temporada y torneo.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.teamId} className={highlight.includes(r.teamId) ? "bg-muted font-semibold" : ""}>
                <TableCell>{r.position}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    {r.crestUrl && <img src={r.crestUrl} alt="" className="h-5 w-5 object-contain" />}
                    {r.teamName}
                  </span>
                </TableCell>
                <TableCell>{r.played}</TableCell>
                <TableCell>{r.won}</TableCell>
                <TableCell>{r.drawn}</TableCell>
                <TableCell>{r.lost}</TableCell>
                <TableCell>{r.goalsFor}</TableCell>
                <TableCell>{r.goalsAgainst}</TableCell>
                <TableCell>{r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}</TableCell>
                <TableCell>{r.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
