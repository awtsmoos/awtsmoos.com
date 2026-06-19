// B"H
/**
 * @file WildlifeCarcassLootPostBuild.js
 * @description Turns defeated wildlife into lootable, UI-visible carcasses.
 *
 * Combat ends, but the gameplay loop continues: a sparkle, a nearby prompt,
 * a loot table, and inventory truth. The Awtsmoos lets even a fallen creature
 * become a lawful source of materials without graphic spectacle.
 */
import { scanDeadAnimalCarcasses, nearestCarcass, openCarcassUi } from "../../../../systems/kosher/CarcassRuntime.js";
import { makeLootableCorpse, lootAll } from "../../../../systems/loot/LootRuntime.js";

const KEY = "__awtsmoosWildlifeCarcassLootTicker";

/**
 * Marks nearby dead animals as carcasses and lootable corpses.
 *
 * @param {object} olam World runtime.
 * @returns {object} Tick report.
 */
export function tickWildlifeCarcassLoot(olam) {
  const made = scanDeadAnimalCarcasses(olam, 24);
  for (const carcass of made) makeLootableCorpse(olam, { id:carcass.animalId, name:carcass.name, species:carcass.species }, { carcassId:carcass.id });
  const hit = nearestCarcass(olam, 6);
  if (hit?.carcass) olam?.ayshPeula?.("ui event", "carcassPanel", { open:true, nearby:true, distance:hit.distance, carcass:hit.carcass, action:"Click / E to loot or process" });
  return { made:made.length, nearby:Boolean(hit?.carcass) };
}

/**
 * Loots the nearest available carcass.
 *
 * @param {object} olam World runtime.
 * @returns {object} Loot result.
 */
export function lootNearestCarcass(olam) {
  const hit = nearestCarcass(olam, 7);
  if (!hit?.carcass) return { ok:false, reason:"no-nearby-carcass" };
  openCarcassUi(olam, hit.carcass);
  return lootAll(olam, `loot_${hit.carcass.animalId}`);
}

/**
 * Installs the carcass loot ticker.
 *
 * @param {object} context Postbuild context.
 * @returns {object|null} Ticker.
 */
export function ensureWildlifeCarcassLoot(context = {}) {
  const olam = context.olam || context;
  if (!olam || olam[KEY]) return olam?.[KEY] || null;
  let acc = 0;
  const ticker = { name:"wildlife_carcass_loot_ticker", type:"livingRegionTicker", isReady:true, heesHawveh:true, heesHawvoos(dt = 1/60) { acc += Number(dt) || 0; if (acc < .5) return; acc = 0; this.lastReport = tickWildlifeCarcassLoot(olam); } };
  olam[KEY] = ticker; olam.__lootNearestCarcass = () => lootNearestCarcass(olam);
  if (Array.isArray(olam.nivrayim)) olam.nivrayim.push(ticker);
  return ticker;
}

export default ensureWildlifeCarcassLoot;
