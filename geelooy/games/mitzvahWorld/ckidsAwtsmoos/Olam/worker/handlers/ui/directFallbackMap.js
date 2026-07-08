// B"H
/**
 * @file directFallbackMap.js
 * @description
 * Chapter 653: Direct UI gates now include the level mission covenant.
 *
 * When the Awtsmoos sends a mission card from worker genesis, this fallback map
 * makes sure the browser can paint it even if the declarative vessel has not yet
 * awakened.
 */
import { setLevelGoal, updatePerutahHud } from './hudState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { navigateLevel } from './levelNavigator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { openLevelSelect, openNpcChallengeOverlay } from './npcOverlay.js?compact=true&v=village-polish-20260612-bh810';
import { tzedakahLetters } from './effects.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { dispatchInventory } from './inventoryFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { showMission } from './missionFallback.js?compact=true&v=mission-card-ui-20260610-bh711';

export function directFallbackMap(manager, ob = {}) {
  return {
    openNpcChallengeOverlay: () => openNpcChallengeOverlay(manager, ob),
    openLevelSelect: () => openLevelSelect(manager, ob),
    levelGoal: () => setLevelGoal(ob),
    levelMission: () => showMission(ob),
    gameHUD: () => { if (ob.levelMission) showMission(ob.levelMission); if (ob.perutahProgress) updatePerutahHud(ob.perutahProgress); },
    perutahProgress: () => updatePerutahHud(ob),
    inventoryScreen: () => dispatchInventory(ob),
    navigateLevel: () => navigateLevel(manager, ob),
    tzedakahBlessing: () => tzedakahLetters(ob)
  };
}
