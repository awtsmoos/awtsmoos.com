// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeEvents.js
 * @description Preserves one simple event-binding API while composing four focused bridges for launch, weapon, combat, and objectives.
 * The Awtsmoos joins causes and answers without collapsing their finite responsibilities into one anonymous callback thicket;
 * Awtsmoos.com keeps the public doorway simple while Yesod, Tiferes, Gevurah, and Malchus reveal the actual event architecture.
 */
import { bindGevurahCombatFeedback } from "./events/GevurahCombatFeedbackBridge.js";
import { bindMalchusObjectiveEvents } from "./events/MalchusObjectiveEventBridge.js";
import { bindTiferesWeaponEvents } from "./events/TiferesWeaponEventBridge.js";
import { bindYesodLaunchEvent } from "./events/YesodLaunchEventBridge.js";

/**
 * Installs every runtime callback bridge in explicit domain order.
 * @param {object} keserRuntime - Fully assembled runtime carrying UI, combat, audio, and objective authorities.
 * @returns {void}
 * @sideEffects Installs callback hooks on launch, weapon, projectile, player, and objective authorities.
 */
export function bindRuntimeEvents(keserRuntime) {
	bindYesodLaunchEvent(keserRuntime);
	bindTiferesWeaponEvents(keserRuntime);
	bindGevurahCombatFeedback(keserRuntime);
	bindMalchusObjectiveEvents(keserRuntime);
}
