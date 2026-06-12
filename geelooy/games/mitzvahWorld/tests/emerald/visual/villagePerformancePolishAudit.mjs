#!/usr/bin/env node
/** B"H @file villagePerformancePolishAudit.mjs @description Guards the village frame-budget repairs. */
import fs from "node:fs";
const read = path => fs.readFileSync(path, "utf8");
const npc = read("ckidsAwtsmoos/dvarim/npc/InteractiveNpc.js");
const render = read("ckidsAwtsmoos/Olam/methods/heesHawvoos.js");
const bars = read("ckidsAwtsmoos/systems/combat/HealthBarSystem.js");
const world = read("ckidsAwtsmoos/Olam/worker/handlers/world.js");
const levels = read("ckidsAwtsmoos/Olam/worker/handlers/ui/npcLevelMarkup.js");
const details = {
  npcNoFrameTraversal: npc.includes("heesHawvoos() {}") && !npc.includes("dance silly"),
  renderBackpressure: render.includes("__renderInFlight") && render.includes("renderAsync"),
  healthCanvasCadence: bars.includes("lastRatio") && bars.includes("const bar = this.selectedBar"),
  chunkedWorldRelease: world.includes("disposeInChunks") && world.includes("await breathe()"),
  avoidsDoubleDestroy: read("ckidsAwtsmoos/Olam/worldManager/StartWorldFlow.js").includes("alreadyDestroyed"),
  friendlyLevelLabels: levels.includes("Enter challenge") && !levels.includes("Load JSON challenge")
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ ok: false, details }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ ok: true, details }, null, 2));
