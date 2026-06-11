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
import { setLevelGoal, updatePerutahHud } from './hudState.js';
import { navigateLevel } from './levelNavigator.js';
import { openLevelSelect, openNpcChallengeOverlay } from './npcOverlay.js?v=npc-scroll-pass-through-20260609-bh638';
import { tzedakahLetters } from './effects.js';
import { dispatchInventory } from './inventoryFallback.js';
import { showMission } from './missionFallback.js?v=mission-card-ui-20260610-bh711';

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
