import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StandingRow } from "@/types";

interface Props {
  rows: StandingRow[];
  highlight: string[];
  season?: string;
  tournament?: string;
}

export default function TablaGeneral({ rows, highlight, season, tournament }: Props) {
  const subtitle = [season, tournament].filter(Boolean).join(" · ");

  return (
    <Card className="standings-card">
      <CardHeader className="standings-header">
        <div>
          <CardTitle>Tabla general</CardTitle>
          {subtitle && <p className="standings-subtitle">{subtitle}</p>}
        </div>
      </CardHeader>

      <CardContent className="standings-content">
        {/* Vista móvil: tarjetas compactas sin scroll horizontal incómodo */}
        <div className="standings-mobile-list" aria-label="Clasificación en vista móvil">
          {rows.length === 0 ? (
            <p className="empty-message text-center py-4">
              No hay posiciones disponibles para esta temporada y torneo.
            </p>
          ) : (
            rows.map((r) => {
              const isHighlighted = highlight.includes(r.teamId);
              const diffFormatted = r.goalDiff > 0 ? `+${r.goalDiff}` : String(r.goalDiff);

              return (
                <article
                  key={r.teamId}
                  className={`standing-mobile-card ${isHighlighted ? "is-highlighted" : ""}`}
                >
                  <div className="standing-mobile-top">
                    <div className="standing-mobile-team">
                      <span className="standing-pos">#{r.position}</span>
                      {r.crestUrl && (
                        <img src={r.crestUrl} alt="" className="h-6 w-6 object-contain shrink-0" />
                      )}
                      <strong className="standing-team-name">{r.teamName}</strong>
                    </div>

                    <div className="standing-pts-badge">
                      <span>PTS</span>
                      <strong>{r.points}</strong>
                    </div>
                  </div>

                  <div className="standing-mobile-metrics">
                    <span>JJ: <b>{r.played}</b></span>
                    <span>G-E-P: <b>{r.won}-{r.drawn}-{r.lost}</b></span>
                    <span>GF:GC: <b>{r.goalsFor}:{r.goalsAgainst}</b></span>
                    <span>DIF: <b>{diffFormatted}</b></span>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Vista escritorio/tablet: tabla completa */}
        <div className="standings-desktop-table">
          <Table>
            <caption className="sr-only">
              Tabla general {subtitle}.
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
                <TableRow
                  key={r.teamId}
                  className={highlight.includes(r.teamId) ? "bg-muted font-semibold" : ""}
                >
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
        </div>
      </CardContent>
    </Card>
  );
}