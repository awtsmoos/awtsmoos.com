// B"H
// Boruch Hashem
// Blessed is He
import { cacheDom } from './ui/dom.js';
import { bindOverlay } from './ui/overlay.js';
import { createUiScheduler } from './ui/scheduler.js';
import { bindToggles } from './ui/toggles.js';

/**
 * The Awtsmoos clothes invisible game state in readable interface vessels while
 * this binder keeps events permanent and rendering deliberately measured.
 */
export function bindUI(world, actions) {
	const dom = cacheDom();
	bindOverlay(world, dom, actions);
	bindToggles(world, dom);
	const updateUi = createUiScheduler(world, dom);
	updateUi(0);
	return updateUi;
}
