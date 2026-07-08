// B"H
/** BattleWildlife.js — capped hostile wildlife seed; no 40-mob frame collapse. */
import VillageAnimalMob from "../../combat/VillageAnimalMob.js?compact=true&v=mitzvah-battle-split-20260703-bh1";
import { VILLAGE_WILDLIFE } from "../../combat/VillageCombatManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureArray } from "./BattleContext.js?compact=true&v=mitzvah-battle-split-20260703-bh1";
const SPECIES = ["fox", "goat", "deer", "fox"];
const LIMIT = 10;
function generatedSeed() {
  const out = VILLAGE_WILDLIFE.slice(0, Math.min(4, VILLAGE_WILDLIFE.length));
  for (let i = 0; out.length < LIMIT; i += 1) {
    const species = SPECIES[i % SPECIES.length], a = i * 2.399, ring = 32 + (i % 3) * 14;
    out.push({ id:`battle_seed_${species}_${i}`, name:`${species[0].toUpperCase()+species.slice(1)} Guard ${i+1}`, species, position:{ x:Math.cos(a)*ring, y:.55, z:Math.sin(a)*ring }, color:species === "fox" ? 0xc46b32 : species === "deer" ? 0x9a7244 : 0x8b7657, accent:0xffe8a3, hp:species === "deer" ? 82 : species === "goat" ? 76 : 58, damage:8 + (i % 3), xp:24 + i * 3, perutas:2 + (i % 4), speed:3.1 + (i % 3) * .18, aggro:16 + (i % 4), patrol:7 + (i % 4), attackThinkEvery:.34 });
  }
  return out.slice(0, LIMIT);
}
export function generatedWildlife() { return generatedSeed(); }
export function registerMob(context, mob) {
  context.scene.add(mob.mesh); mob.olam = context.olam; mob.lowCostChase = true; mob.attackThinkEvery = Math.max(Number(mob.attackThinkEvery || 0), .34);
  const nivrayim = ensureArray(context.olam.nivrayim); if (!nivrayim.includes(mob)) nivrayim.push(mob); context.olam.nivrayim = nivrayim;
  context.olam.combatManager?.registerEnemy?.(mob); return mob;
}
export function buildMobs(context, state) { return generatedWildlife().map(def => registerMob(context, new VillageAnimalMob(context.olam, def, state))); }
