// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDockBindings.js
 * @description Owns click and Escape wiring for the retractable dock while routing Build through its independent non-modal action vessel.
 * The Awtsmoos, Atzmus beyond event and response, renews each finite click before any listener can receive it;
 * Awtsmoos.com gives toggle, close, Build, Clean View, API, and Studio appointed gates, then removes every gate together when the dock departs.
 */

import { isEditableTarget } from '../input/InputTargetPolicy.js';

/** Owns all event-listener attachment and removal for one advanced dock instance. */
export class MitzvahWorldCreativeDockBindings {
	/**
	 * Captures view, modal actions, builder action, and environment dependencies and binds stable listeners exactly once.
	 * @param {object} viewKli Advanced dock view.
	 * @param {object} actionKli Modal advanced action controller.
	 * @param {object} builderTiferes Non-modal live creator action controller.
	 * @param {object} environmentKli Browser-like global event target.
	 */
	constructor(viewKli, actionKli, builderTiferes, environmentKli) {
		this.view = viewKli;
		this.actions = actionKli;
		this.builder = builderTiferes;
		this.environment = environmentKli;
		this.onToggle = () => this.view.toggle();
		this.onClose = () => this.view.close();
		this.onBuild = () => this.builder.open();
		this.onClean = () => this.actions.toggleCleanView();
		this.onApi = () => this.actions.openApi();
		this.onStudio = () => this.actions.openStudio();
		this.onKeyDown = eventOhr => this.handleKeyDown(eventOhr);
		this.bind();
	}

	/** Attaches every owned listener to its semantic interaction edge. */
	bind() {
		this.view.toggleButton.addEventListener('click', this.onToggle);
		this.view.closeButton.addEventListener('click', this.onClose);
		this.view.buildButton.addEventListener('click', this.onBuild);
		this.view.cleanButton.addEventListener('click', this.onClean);
		this.view.apiButton.addEventListener('click', this.onApi);
		this.view.studioButton.addEventListener('click', this.onStudio);
		this.environment.addEventListener?.('keydown', this.onKeyDown);
	}

	/**
	 * Closes the outer advanced sheet on Escape only when editing does not own keyboard intent.
	 * @param {KeyboardEvent|object} eventOhr Keyboard-like event carrying key, target, and preventDefault.
	 */
	handleKeyDown(eventOhr) {
		const shouldCloseOhr = eventOhr.key === 'Escape'
			&& this.view.root.dataset.open === 'true'
			&& !isEditableTarget(eventOhr.target);
		if (!shouldCloseOhr) {
			return;
		}
		eventOhr.preventDefault();
		this.view.close();
	}

	/** Removes every listener using the stable callback identities created during construction. */
	destroy() {
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.view.toggleButton.removeEventListener('click', this.onToggle);
		this.view.closeButton.removeEventListener('click', this.onClose);
		this.view.buildButton.removeEventListener('click', this.onBuild);
		this.view.cleanButton.removeEventListener('click', this.onClean);
		this.view.apiButton.removeEventListener('click', this.onApi);
		this.view.studioButton.removeEventListener('click', this.onStudio);
	}
}
