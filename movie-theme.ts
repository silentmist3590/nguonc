export const MoviePalettes = {
  dark: {
    background: "#090B12",
    surface: "#121722",
    surfaceRaised: "#1A202D",
    line: "#252C39",
    text: "#F3F2EE",
    muted: "#969CAA",
    amber: "#F2B95F",
    amberSoft: "#5A4524",
    wine: "#B9364E",
    white: "#FFFFFF",
    accentText: "#16130D",
    placeholder: "#727887",
    heroScrim: "rgba(4,7,13,0.52)",
  },
  light: {
    background: "#F7F4ED",
    surface: "#FFFDF8",
    surfaceRaised: "#EEE8DA",
    line: "#DDD5C7",
    text: "#252018",
    muted: "#6E675D",
    amber: "#825000",
    amberSoft: "#F0E2C6",
    wine: "#A73349",
    white: "#FFFFFF",
    accentText: "#17130C",
    placeholder: "#80786C",
    heroScrim: "rgba(6,9,15,0.66)",
  },
} as const;

export type MovieColorScheme = keyof typeof MoviePalettes;
export type MoviePalette = { [K in keyof typeof MoviePalettes.dark]: string };
