// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRailBindings.js
 * @description Owns creator rail click and Escape listeners without capturing WASD, arrows, camera, or other gameplay input globally.
 * The Awtsmoos lets creator intention coexist with ordinary motion; Awtsmoos.com binds only buttons inside this vessel,
 * so touch and keyboard may build deliberately while the living player's movement keeps its own ancient gate.
 */

import { isEditableTarget } from '../../input/InputTargetPolicy.js';

/** Owns stable creator UI event listener identities and teardown. */
export class MitzvahWorldCreatorRailBindings {
	/** Binds scoped rail click delegation plus one non-editing Escape close intent. */
	constructor(viewKli, controllerKli, environmentKli = globalThis) {
		this.view = viewKli;
		this.controller = controllerKli;
		this.environment = environmentKli;
		this.onClick = eventOhr => this.handleClick(eventOhr);
		this.onKeyDown = eventOhr => this.handleKeyDown(eventOhr);
		viewKli.root.addEventListener('click', this.onClick);
		environmentKli.addEventListener?.('keydown', this.onKeyDown);
	}

	/** Routes only semantic data hooks from inside the localized creator rail. */
	handleClick(eventOhr) {
		const materialKli = eventOhr.target?.closest?.('[data-creator-material]');
		if (materialKli) {
			this.controller.select(materialKli.dataset.creatorMaterial);
			return;
		}
		if (eventOhr.target?.closest?.('[data-creator-close]')) {
			this.controller.close();
			return;
		}
		if (eventOhr.target?.closest?.('[data-creator-collapse]')) {
			this.controller.toggleCollapsed();
			return;
		}
		const actionKli = eventOhr.target?.closest?.('[data-creator-action]');
		if (actionKli) {
			this.controller.perform(actionKli.dataset.creatorAction);
		}
	}

	/** Closes creator chrome on Escape without stealing keyboard movement or editing intent. */
	handleKeyDown(eventOhr) {
		if (eventOhr.key !== 'Escape' || isEditableTarget(eventOhr.target) || this.view.root.dataset.open !== 'true') {
			return;
		}
		this.controller.close();
	}

	/** Removes exactly the listeners owned by this binding vessel. */
	destroy() {
		this.view.root.removeEventListener('click', this.onClick);
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
	}
}
