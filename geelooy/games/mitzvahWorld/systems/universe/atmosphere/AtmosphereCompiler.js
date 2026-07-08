// B"H
import { compileSunAtmosphere } from "./SunAtmosphereCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { compileLensFlare } from "./LensFlareCompiler.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function compileAtmosphere(zone = {}) { const a = zone.atmosphere || {}; return [compileSunAtmosphere(a), compileLensFlare(a), { type:"fog", id:"zone_fog", fog:a.fog || "clear", command:"ensure_fog" }]; }
