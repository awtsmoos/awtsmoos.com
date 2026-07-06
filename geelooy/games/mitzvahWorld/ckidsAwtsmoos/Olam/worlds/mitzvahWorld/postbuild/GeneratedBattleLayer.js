// B"H
/**
 * GeneratedBattleLayer.js — split, cache-bumped battle wildlife installer.
 * Runtime mob construction stays in BattleWildlife: new VillageAnimalMob and
 * combatManager.registerEnemy live there so this coordinator remains small.
 */
import VillageCombatState from "../combat/VillageCombatState.js?v=village-polish-20260612-bh810";
import { VILLAGE_BATTLE_DECOR, VILLAGE_COMBAT_MISSION } from "../combat/VillageCombatManifest.js";
import { getVillageGroundNavigator } from "../combat/VillageGroundNavigator.js?v=mitzvah-battle-split-20260703-bh1";
import { groundVillageNow } from "../../../methods/loadNivrayim/villageGrounding.js?v=mitzvah-battle-split-20260703-bh1";
import { INSTALLED_KEY, isVillageContext } from "./battle/BattleContext.js?v=mitzvah-battle-split-20260703-bh1";
import { addDecor } from "./battle/BattleDecor.js?v=mitzvah-battle-split-20260703-bh1";
import { buildMobs } from "./battle/BattleWildlife.js?v=mitzvah-battle-split-20260703-bh1";

export async function ensureGeneratedBattleLayer(context = {}) {
  if (!context.scene || !context.olam || !isVillageContext(context)) return [];
  if (context.olam[INSTALLED_KEY]) return context.olam[INSTALLED_KEY];
  context.olam.__villageGroundNavigator = getVillageGroundNavigator(context.olam);
  const state = new VillageCombatState(context.olam, VILLAGE_COMBAT_MISSION);
  context.olam.__villageCombatState = state;
  const decor = VILLAGE_BATTLE_DECOR.map(def => addDecor(context.scene, def));
  const mobs = buildMobs(context, state);
  context.olam[INSTALLED_KEY] = decor.concat(mobs);
  groundVillageNow(context.olam, mobs, false, "battle-layer-postbuild");
  return context.olam[INSTALLED_KEY];
}
