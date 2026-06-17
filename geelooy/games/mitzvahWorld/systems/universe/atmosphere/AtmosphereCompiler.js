// B"H
import { compileSunAtmosphere } from "./SunAtmosphereCompiler.js";
import { compileLensFlare } from "./LensFlareCompiler.js";
export function compileAtmosphere(zone = {}) { const a = zone.atmosphere || {}; return [compileSunAtmosphere(a), compileLensFlare(a), { type:"fog", id:"zone_fog", fog:a.fog || "clear", command:"ensure_fog" }]; }
