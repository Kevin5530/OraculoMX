import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import type { Probabilities } from "@/types";

const RESULTS = [
  {
    key: "home",
    label: "Local",
    verdict: "Victoria local",
    color: "#08bf8a",
  },
  {
    key: "draw",
    label: "Empate",
    verdict: "Empate",
    color: "#ffb000",
  },
  {
    key: "away",
    label: "Visitante",
    verdict: "Victoria visitante",
    color: "#ff414b",
  },
] as const;

function format(value: number) {
  return `${Number(value.toFixed(1))}%`;
}

export default function GraficaProbabilidades({ model }: { model?: Probabilities }) {
  const rows = RESULTS.map((result) => ({
    ...result,
    value: model?.[result.key] ?? 0,
  }));

  // El centro destaca el resultado más probable e informa si comparten el máximo.
  const highest = Math.max(...rows.map((row) => row.value));

  const leaders = rows.filter((row) => row.value === highest);

  const leader = leaders[0]!;
  const tied = leaders.length > 1;

  return (
    <section
      className="dashboard-panel probability-panel"
      aria-labelledby="probability-title"
    >
      <h2 id="probability-title">Probabilidad de Resultado</h2>

      <div className="probability-chart">
        {model ? (
          <div className="donut-visual" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={72}
                  outerRadius={96}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {rows.map((row) => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-donut" aria-hidden="true" />
        )}

        <div className="donut-center">
          <strong
            style={{
              color: model ? (tied ? "#f8fafc" : leader.color) : undefined,
            }}
          >
            {model ? format(highest) : "—"}
          </strong>

          <span>
            {model
              ? tied
                ? "Máxima compartida"
                : leader.verdict
              : "Sin predicción"}
          </span>
        </div>
      </div>

      <ul className="probability-legend">
        {rows.map((row) => (
          <li key={row.key}>
            <span>
              <i
                style={{
                  background: row.color,
                  boxShadow: `0 0 10px ${row.color}80`,
                }}
                aria-hidden="true"
              />

              {row.label}
            </span>

            <strong style={{ color: row.color }}>
              {model ? format(row.value) : "—"}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
