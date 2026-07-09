// B"H
/**
 * GeneratedBattleLayer.js — split, cache-bumped battle wildlife installer.
 * Runtime mob construction stays in BattleWildlife: new VillageAnimalMob and
 * combatManager.registerEnemy live there so this coordinator remains small.
 */
import VillageCombatState from "../combat/VillageCombatState.js?compact=true&v=village-polish-20260612-bh810";
import { VILLAGE_BATTLE_DECOR, VILLAGE_COMBAT_MISSION } from "../combat/VillageCombatManifest.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { getVillageGroundNavigator } from "../combat/VillageGroundNavigator.js?compact=true&v=mitzvah-battle-split-20260703-bh1";
import { groundVillageNow } from "../../../methods/loadNivrayim/villageGrounding.js?compact=true&v=mitzvah-battle-split-20260703-bh1";
import { INSTALLED_KEY, isVillageContext } from "./battle/BattleContext.js?compact=true&v=mitzvah-battle-split-20260703-bh1";
import { addDecor } from "./battle/BattleDecor.js?compact=true&v=mitzvah-battle-split-20260703-bh1";
import { buildMobs } from "./battle/BattleWildlife.js?compact=true&v=mitzvah-battle-split-20260703-bh1";

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
