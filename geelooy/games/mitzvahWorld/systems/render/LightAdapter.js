// B"H
/** Lighting commands stay pure until the chosen renderer consumes them. */
export function lightCommand(kind = "ambient", detail = {}) { return { adapter:"light", kind, detail }; }
export function movieSunLight() { return lightCommand("movie_sun", { intensity:1.2, mood:"hyper_real_arrival" }); }
