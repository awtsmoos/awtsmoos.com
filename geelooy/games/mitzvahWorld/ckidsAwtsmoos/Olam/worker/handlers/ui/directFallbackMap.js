// B"H
/** @file directFallbackMap.js @description Chapter 400: Direct UI gates are mapped without hidden switch smoke. */
import { setLevelGoal, updatePerutahHud } from './hudState.js';
import { navigateLevel } from './levelNavigator.js';
import { openLevelSelect, openNpcChallengeOverlay } from './npcOverlay.js?v=npc-scroll-pass-through-20260609-bh638';
import { tzedakahLetters } from './effects.js';
import { dispatchInventory } from './inventoryFallback.js';
export function directFallbackMap(manager, ob = {}) {
  return {
    openNpcChallengeOverlay: () => openNpcChallengeOverlay(manager, ob),
    openLevelSelect: () => openLevelSelect(manager, ob),
    levelGoal: () => setLevelGoal(ob),
    perutahProgress: () => updatePerutahHud(ob),
    inventoryScreen: () => dispatchInventory(ob),
    navigateLevel: () => navigateLevel(manager, ob),
    tzedakahBlessing: () => tzedakahLetters(ob)
  };
}
