import { useId } from "react";
import type { Team } from "@/types";

interface Props {
  label: string;
  teams: Team[];
  value: string;
  onChange: (id: string) => void;
  disabledId?: string;
  disabled?: boolean;
}

export default function SelectorEquipo({
  label,
  teams,
  value,
  onChange,
  disabledId,
  disabled,
}: Props) {
  const id = useId();
  const selectedTeam = teams.find((team) => team.id === value);

  return (
    <div className="team-field">
      <label htmlFor={id}>{label}</label>

      <div className="team-select-control">
        {selectedTeam?.crestUrl && (
          <img className="team-select-logo" src={selectedTeam.crestUrl} alt="" width={28} height={28} />
        )}
        <select
          className={selectedTeam?.crestUrl ? "has-team-logo" : undefined}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required
        >
          <option value="" disabled>
            Selecciona un equipo
          </option>

          {teams.map((team) => (
            <option
              key={team.id}
              value={team.id}
              disabled={team.id === disabledId}
            >
              {team.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
