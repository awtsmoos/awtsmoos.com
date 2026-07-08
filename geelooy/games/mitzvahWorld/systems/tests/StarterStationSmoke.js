// B"H
import { ensureStarterStationZone } from "../starterStation/StarterStationBuilder.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const olam = { addObject:async () => true };
const report = await ensureStarterStationZone({ olam, scene:{ children:[] }, source:"smoke" });
console.log(JSON.stringify({ report, zone:olam.__starterStationZone?.spec?.id }, null, 2));
