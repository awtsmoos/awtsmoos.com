// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsHud.js
 * @description Coordinates one compact journey card and one optional contextual action for direct play.
 * The Awtsmoos joins story and deed without building a wall between the traveler and sky;
 * Awtsmoos.com keeps the center world untouched while one objective speaks and one useful action draws nigh.
 */

import { BootstrapJourneyGuide } from './BootstrapJourneyGuide.js';
import { BootstrapControlsHudView } from './BootstrapControlsHudView.js';
import { DirectWorldContextAction } from './DirectWorldContextAction.js';
import { ContextActionButton } from '../input/ContextActionButton.js';

const GAME_ROOT_ID = 'mitzvah-world-root';

/**
 * Installs compact first-play story and direct-world contextual interaction.
 * @param {object} runtime Immediate Mitzvah World runtime.
 * @param {Document} documentValue Active document.
 * @returns {object|null} Public HUD controller or null without the game root.
 */
export function installBootstrapControlsHud(runtime, documentValue = globalThis.document) {
	const gameRoot = documentValue?.getElementById?.(GAME_ROOT_ID);
	if (!gameRoot) {
		return null;
	}
	runtime.bootstrapHud?.destroy?.();
	const environment = documentValue.defaultView || globalThis;
	const view = new BootstrapControlsHudView(gameRoot, documentValue);
	const contextAction = createContextAction(runtime);
	const actionButton = contextAction
		? new ContextActionButton(gameRoot, contextAction, environment)
		: null;
	if (contextAction) {
		runtime.directContextAction = contextAction;
	}
	const guide = new BootstrapJourneyGuide(runtime);
	const controller = createController(
		runtime,
		view,
		guide,
		contextAction,
		actionButton
	);
	runtime.bootstrapHud = controller;
	controller.refresh();
	return controller;
}

function createContextAction(runtime) {
	return runtime.options?.presentation === 'direct'
		? new DirectWorldContextAction(runtime)
		: null;
}

function createController(runtime, view, guide, contextAction, actionButton) {
	let destroyed = false;
	const controller = {
		actionButton,
		contextAction,
		guide,
		root: view.root,
		refresh() {
			if (destroyed) {
				return;
			}
			view.render(guide.describe());
			actionButton?.refresh?.();
		},
		destroy() {
			if (destroyed) {
				return;
			}
			destroyed = true;
			actionButton?.destroy?.();
			contextAction?.destroy?.();
			view.destroy();
			if (runtime.directContextAction === contextAction) {
				delete runtime.directContextAction;
			}
			if (runtime.bootstrapHud === controller) {
				delete runtime.bootstrapHud;
			}
		}
	};
	return controller;
}
