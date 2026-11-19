import type { MatchResult, TeamForm } from "@/types";

// La API usa G/E/P.
// La interfaz muestra V/E/D como en la captura.
const RESULTS: Record<
  MatchResult,
  {
    letter: string;
    label: string;
    className: string;
  }
> = {
  G: {
    letter: "V",
    label: "Victoria",
    className: "result-win",
  },
  E: {
    letter: "E",
    label: "Empate",
    className: "result-draw",
  },
  P: {
    letter: "D",
    label: "Derrota",
    className: "result-loss",
  },
};

interface Props {
  form: {
    home: TeamForm;
    away: TeamForm;
  };
  home: string;
  away: string;
}

export default function RachaReciente({ form, home, away }: Props) {
  const teams = [
    {
      side: "Local",
      name: home,
      form: form.home,
    },
    {
      side: "Visitante",
      name: away,
      form: form.away,
    },
  ];

  return (
    <div className="recent-form">
      {teams.map((team) => (
        <div className="form-row" key={team.side}>
          <span title={team.name}>{team.side}</span>

          <ol
            className="result-list"
            aria-label={`Últimos partidos de ${team.name}`}
          >
            {team.form.results.map((result, index) => (
              <li
                key={index}
                className={"result-badge " + RESULTS[result].className}
                title={RESULTS[result].label}
              >
                <span aria-hidden="true">{RESULTS[result].letter}</span>

                <span className="sr-only">{RESULTS[result].label}</span>
              </li>
            ))}
          </ol>

          {team.form.results.length === 0 ? (
            <span className="no-results">Sin partidos</span>
          ) : (
            <p className="basis-full text-xs text-muted-foreground">
              Promedio de goles: {team.form.avgGoalsFor.toFixed(1)} a favor · {team.form.avgGoalsAgainst.toFixed(1)} en contra
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
