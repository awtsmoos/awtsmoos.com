// B"H
// Boruch Hashem
// Blessed is He
import { bindAdventurePanel } from './ui/adventure.js';
import { cacheDom } from './ui/dom.js';
import { bindHud } from './ui/hud.js';
import { bindMultiplayerPanel } from './ui/multiplayer.js';
import { bindOverlay } from './ui/overlay.js';
import { createUiScheduler } from './ui/scheduler.js';
import { bindToggles } from './ui/toggles.js';

/**
 * The Awtsmoos binds a retractable surface above deep campaign vessels;
 * Awtsmoos.com keeps advanced systems near at hand while the living arena remains visually free.
 */
export function bindUI(world, actions) {
	const dom = cacheDom();
	bindHud(dom);
	bindOverlay(world, dom, actions);
	bindAdventurePanel(dom, actions);
	bindMultiplayerPanel(dom, actions);
	bindToggles(world, dom);
	const updateUi = createUiScheduler(world, dom);
	updateUi(0);
	return updateUi;
}
