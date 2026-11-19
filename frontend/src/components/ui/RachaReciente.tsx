import type { MatchResult, TeamForm } from "@/types";

const RESULTS: Record<
  MatchResult,
  {
    letter: string;
    label: string;
    className: string;
  }
> = {
  G: { letter: "V", label: "Victoria", className: "result-win" },
  E: { letter: "E", label: "Empate", className: "result-draw" },
  P: { letter: "D", label: "Derrota", className: "result-loss" },
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
    { side: "Local", name: home, form: form.home },
    { side: "Visitante", name: away, form: form.away },
  ];

  return (
    <div className="recent-form">
      {teams.map((team) => (
        <div className="form-row" key={team.side}>
          <div className="form-row-header">
            <span title={team.name}>{team.name}</span>
            <span className="text-xs text-muted-foreground">{team.side}</span>
          </div>

          {team.form.results.length === 0 ? (
            <span className="no-results">Sin partidos</span>
          ) : (
            <>
              <ol className="result-list" aria-label={`Últimos partidos de ${team.name}`}>
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

              <div className="goals-pills">
                <span>GF: <strong>{team.form.avgGoalsFor.toFixed(1)}</strong></span>
                <span>GC: <strong>{team.form.avgGoalsAgainst.toFixed(1)}</strong></span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}