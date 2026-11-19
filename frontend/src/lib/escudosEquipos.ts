const TEAM_LOGOS: Record<string, string> = {
  atlante: "atlante",
  atlas: "atlas",
  "atletico san luis": "atletico-de-san-luis",
  "guadalajara chivas": "cd-guadalajara",
  "guadalajara (chivas)": "cd-guadalajara",
  guadalajara: "cd-guadalajara",
  veracruz: "cd-veracruz",
  "club america": "club-america",
  "club leon": "club-leon",
  leon: "club-leon",
  tijuana: "club-tijuana",
  "cruz azul": "cruz-azul",
  juarez: "fc-juarez",
  "leones negros": "leones-negros-udeg",
  "mazatlan fc": "mazatlan-fc",
  monterrey: "monterrey",
  necaxa: "necaxa",
  pachuca: "pachuca",
  puebla: "puebla",
  queretaro: "queretaro-fc",
  "santos laguna": "santos-laguna",
  "tigres uanl": "tigres-uanl",
  toluca: "toluca",
  "deportivo toluca": "toluca",
  "unam pumas": "unam-pumas",
  "pumas unam": "unam-pumas",
};

export function obtenerEscudoEquipo(name: string): string {
  // Los nombres conservan el formato de la API; solo se normalizan al buscar el SVG.
  const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().toLowerCase().replace(/\s+/g, " ");
  const filename = TEAM_LOGOS[normalizedName];
  return filename ? `${import.meta.env.BASE_URL}team-logos/${filename}.svg` : "";
}
