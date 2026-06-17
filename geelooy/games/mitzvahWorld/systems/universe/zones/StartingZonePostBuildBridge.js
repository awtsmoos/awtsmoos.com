// B"H
import { buildStartingZoneRuntime } from "./StartingZoneRuntime.js";
export function ensureStartingZonePostBuild(context = {}) { const zone = context.startingZoneJson || context.zoneJson || null; if (!zone) return null; const runtime = buildStartingZoneRuntime(zone); const holder = context.olam || context; holder.__awtsmoosStartingZoneRuntime = runtime; return runtime; }
