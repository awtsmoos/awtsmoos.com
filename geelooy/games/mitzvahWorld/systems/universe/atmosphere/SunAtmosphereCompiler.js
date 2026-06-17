// B"H
export function compileSunAtmosphere(atmosphere = {}) { return { type:"sun_atmosphere", id:"sun_atmosphere", sun:atmosphere.sun || "soft", command:"ensure_sun_atmosphere" }; }
