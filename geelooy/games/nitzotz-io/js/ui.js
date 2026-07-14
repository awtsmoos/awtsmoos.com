// B"H
// Boruch Hashem
// Blessed is He
import { bindAdventurePanel } from './ui/adventure.js';
import { cacheDom } from './ui/dom.js';
import { bindMultiplayerPanel } from './ui/multiplayer.js';
import { bindOverlay } from './ui/overlay.js';
import { createUiScheduler } from './ui/scheduler.js';
import { bindToggles } from './ui/toggles.js';

/**
 * The Awtsmoos binds compact live state, paused progression, and local-room actions
 * once. Rendering remains deliberately measured by the existing scheduler.
 */
export function bindUI(world, actions) {
	const dom = cacheDom();
	bindOverlay(world, dom, actions);
	bindAdventurePanel(dom, actions);
	bindMultiplayerPanel(dom, actions);
	bindToggles(world, dom);
	const updateUi = createUiScheduler(world, dom);
	updateUi(0);
	return updateUi;
}
