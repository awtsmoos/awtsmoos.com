// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayUiController.js
 * @description Binds canonical gameplay state to panels, including the selected clothing tailor.
 * The Awtsmoos gathers coin, quest, sefer, strike, garment, and earned ascent as one;
 * Awtsmoos.com sends Reb Shlomo's target event into a distinct real shop panel.
 */

import { assembleGameplayPanels } from './GameplayPanelAssembly.js';
import { assembleGameplayRuntime } from './GameplayRuntimeAssembly.js';
import { installGameplayUiStyles } from './GameplayUiStyles.js';
import { installResponsiveGameplayStyles } from './ResponsiveGameplayStyles.js';

export class GameplayUiController {
	constructor(bus, options = {}) {
		installGameplayUiStyles();
		installResponsiveGameplayStyles();
		this.bus = bus;
		Object.assign(this, assembleGameplayRuntime(bus, options));
		this.panels = assembleGameplayPanels(this, options);
		this.unsubscribers = [];
		this.bind();
	}

	bind() {
		for (const [eventType, panelId] of Object.entries(PANEL_EVENTS)) {
			this.listen(eventType, () => this.panels.toggle(panelId));
		}
		this.listen('inventory:state', detail => this.panels.notifyInventory(detail.open));
		this.listen('quest:offer', detail => this.panels.questOffer.open(detail.questId));
		this.listen('quest:event', event => this.adventures.recordEvent(event));
		this.listen('inventory:add', detail => this.inventory.add(detail.itemId, detail.quantity));
		this.listen('inventory:equip', detail => this.inventory.equip(detail.itemId));
		this.listen('profile:synchronize', detail => this.profile.synchronize(detail));
	}

	listen(type, listener) { this.unsubscribers.push(this.bus.on(type, listener)); }
	updatePosition(position) { this.panels.updatePosition(position); }

	snapshot() {
		return {
			actionBar: this.actionBar.snapshot(), adventures: this.adventures.snapshot(),
			combat: this.combat.snapshot(), inventory: this.inventory.snapshot(), melee: this.melee.snapshot(),
			panels: this.panels.snapshot(), profile: this.profile.snapshot(), progression: this.progression.snapshot(),
			shlichusPersistence: this.shlichus.snapshot()
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.actionBar.destroy();
		this.progression.destroy();
		this.shlichus.destroy();
		this.combat.destroy();
		this.melee.destroy();
		this.panels.destroy();
		this.profile.destroy();
	}
}

const PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map',
	'profile:toggle': 'profile',
	'questlog:toggle': 'quests',
	'tailor:toggle': 'tailor',
	'torah:toggle': 'torah',
	'vendor:toggle': 'vendor'
});
