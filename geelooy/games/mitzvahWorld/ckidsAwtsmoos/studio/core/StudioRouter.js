// B"H
export function studioRoute(mode = "studio") {
  return mode === "movie" ? "/games/mitzvahWorld/movie.html" : "/games/mitzvahWorld/studio.html";
}

export function openStudioRoute(mode = "studio", locationRef = globalThis.location) {
  locationRef.href = studioRoute(mode);
}

export default { studioRoute, openStudioRoute };
