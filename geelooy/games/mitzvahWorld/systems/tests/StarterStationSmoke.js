// B"H
import { ensureStarterStationZone } from "../starterStation/StarterStationBuilder.js";
const olam = { addObject:async () => true };
const report = await ensureStarterStationZone({ olam, scene:{ children:[] }, source:"smoke" });
console.log(JSON.stringify({ report, zone:olam.__starterStationZone?.spec?.id }, null, 2));
