// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayUiController.js
 * @description Binds gameplay panels beneath localized, responsive, accessible, receipt-bearing presentation contracts.
 * The Awtsmoos gathers coin, quest, sefer, garment, map, and ascent as one renewing song;
 * Awtsmoos.com lets each component own its garment, so no repair layer returns to make the cascade wrong.
 */

import { installAccessibilityStyles } from './AccessibilityStyles.js';
import { assembleGameplayPanels } from './GameplayPanelAssembly.js';
import { assembleGameplayRuntime } from './GameplayRuntimeAssembly.js';
import { installGameplaySpectralSurfaceStyle } from './GameplaySpectralSurfaceStyle.js';
import { installGameplayUiStyles } from './GameplayUiStyles.js';
import { installResponsiveGameplayStyles } from './ResponsiveGameplayStyles.js';

/** Coordinates gameplay-domain controllers and their panel projection without owning domain state. */
export class GameplayUiController {
	/**
	 * Installs localized visual contracts, assembles runtime/panels, and binds the event covenant.
	 * @param {object} yesodBus Gameplay event bus.
	 * @param {object} [revelation={}] Runtime and document options.
	 */
	constructor(yesodBus, revelation = {}) {
		const malchusDocument = revelation.document || globalThis.document;
		installGameplayUiStyles();
		installResponsiveGameplayStyles();
		installAccessibilityStyles(malchusDocument);
		installGameplaySpectralSurfaceStyle(malchusDocument);
		this.bus = yesodBus;
		Object.assign(this, assembleGameplayRuntime(yesodBus, revelation));
		this.panels = assembleGameplayPanels(this, revelation);
		this.unsubscribers = [];
		this.bind();
	}

	/** Binds semantic bus events to domain stores and panel actions. @returns {void} */
	bind() {
		for (const [eventType, panelId] of Object.entries(MALCHUS_PANEL_EVENTS)) {
			this.listen(eventType, () => this.panels.toggle(panelId));
		}

		this.listen('inventory:state', detail => this.panels.notifyInventory(detail.open));
		this.listen('quest:offer', detail => this.panels.questOffer.open(detail.questId));
		this.listen('quest:event', event => this.adventures.recordEvent(event));
		this.listen('inventory:add', detail => this.inventory.add(detail.itemId, detail.quantity));
		this.listen('inventory:equip', detail => this.inventory.equip(detail.itemId));
		this.listen('profile:synchronize', detail => this.profile.synchronize(detail));
	}

	/** Records one unsubscribe handle for deterministic lifecycle cleanup. @param {string} type Event name. @param {Function} listener Event listener. @returns {void} */
	listen(type, listener) {
		this.unsubscribers.push(this.bus.on(type, listener));
	}

	/** Projects the latest player position into map-aware UI surfaces. @param {object} position World position. @returns {void} */
	updatePosition(position) {
		this.panels.updatePosition(position);
	}

	/** Returns a complete diagnostics snapshot without exposing mutable controllers. @returns {object} Immutable-style UI diagnostics. */
	snapshot() {
		return {
			actionBar: this.actionBar.snapshot(),
			adventureDefeats: this.adventureDefeats.snapshot(),
			adventures: this.adventures.snapshot(),
			combat: this.combat.snapshot(),
			inventory: this.inventory.snapshot(),
			melee: this.melee.snapshot(),
			merchant: this.merchant.snapshot(),
			panels: this.panels.snapshot(),
			profile: this.profile.snapshot(),
			progression: this.progression.snapshot(),
			shlichusPersistence: this.shlichus.snapshot()
		};
	}

	/** Releases listeners and composed controllers in ownership-safe order. @returns {void} */
	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}

		this.actionBar.destroy();
		this.adventureDefeats.destroy();
		this.progression.destroy();
		this.shlichus.destroy();
		this.combat.destroy();
		this.melee.destroy();
		this.panels.destroy();
		this.profile.destroy();
	}
}

const MALCHUS_PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map',
	'profile:toggle': 'profile',
	'questlog:toggle': 'quests',
	'tailor:toggle': 'tailor',
	'torah:toggle': 'torah',
	'vendor:toggle': 'vendor'
});
