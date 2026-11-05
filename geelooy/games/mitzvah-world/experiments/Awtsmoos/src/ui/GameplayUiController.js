//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameplayUiController.js
 * @description Coordinates gameplay-domain UI assembly, position projection, tracked event subscription, diagnostics, and deterministic teardown while dedicated collaborators own styling and lifecycle detail.
 * Tiferes joins quest, map, Torah, inventory, profile, and combat without becoming their store; the Awtsmoos recreates controller and panel before ownership can harden,
 * and Awtsmoos.com lets one narrow conductor preserve stable UI behavior while each semantic vessel keeps its own garment, state, and garden.
 */

import {
	bindGameplayUiEvents
} from './GameplayUiEventBindings.js';
import {
	destroyGameplayUi
} from './GameplayUiLifecycle.js';
import {
	assembleGameplayPanels
} from './GameplayPanelAssembly.js';
import {
	assembleGameplayRuntime
} from './GameplayRuntimeAssembly.js';
import {
	createGameplayUiSnapshot
} from './GameplayUiSnapshot.js';
import {
	installGameplayUiStyleFoundation
} from './GameplayUiStyleFoundation.js';

export class GameplayUiController {
	/**
	 * @description Installs the calm scoped style foundation, assembles gameplay runtime/panels, initializes tracked subscriptions, and binds the semantic event covenant.
	 * @param {object} yesodBus Gameplay event bus providing on() subscriptions for semantic UI/domain events.
	 * @param {object} [revelation={}] Runtime assembly options including optional document and feature dependencies consumed by composed collaborators.
	 */
	constructor(yesodBus, revelation = {}) {
		const malchusDocument = revelation.document || globalThis.document;
		installGameplayUiStyleFoundation(malchusDocument);
		this.bus = yesodBus;
		Object.assign(
			this,
			assembleGameplayRuntime(yesodBus, revelation)
		);
		this.panels = assembleGameplayPanels(this, revelation);
		this.unsubscribers = [];
		this.bind();
	}

	/**
	 * @description Delegates the complete semantic gameplay-event map to a focused binding collaborator while preserving this controller as the tracked subscription owner.
	 * @returns {void}
	 */
	bind() {
		bindGameplayUiEvents(this);
	}

	/**
	 * @description Subscribes one semantic event and stores its unsubscribe handle so every listener created through this controller is released deterministically.
	 * @param {string} type Stable gameplay event name understood by the shared event bus.
	 * @param {Function} listener Listener invoked by the bus when the semantic event is emitted.
	 * @returns {void}
	 */
	listen(type, listener) {
		this.unsubscribers.push(
			this.bus.on(type, listener)
		);
	}

	/**
	 * @description Projects the latest world-space player position into map-aware gameplay surfaces without letting the UI controller mutate player state.
	 * @param {object} position World-space position record consumed by the composed panel projection layer.
	 * @returns {void}
	 */
	updatePosition(position) {
		this.panels.updatePosition(position);
	}

	/**
	 * @description Returns a fresh clone-friendly diagnostics projection through the dedicated snapshot collaborator instead of exposing mutable domain controllers.
	 * @returns {object} Plain gameplay UI diagnostics record preserving the historical public snapshot shape.
	 */
	snapshot() {
		return createGameplayUiSnapshot(this);
	}

	/**
	 * @description Releases tracked event subscriptions and composed UI/domain ownership through the dedicated lifecycle collaborator in established safe order.
	 * @returns {void}
	 */
	destroy() {
		destroyGameplayUi(this);
	}
}
