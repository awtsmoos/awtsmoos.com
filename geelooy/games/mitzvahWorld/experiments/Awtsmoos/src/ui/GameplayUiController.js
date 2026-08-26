// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayUiController.js
<<<<<<< HEAD
 * @description Binds gameplay panels beneath responsive, spectral, touchable, and motion-respectful contracts.
=======
 * @description Binds gameplay panels beneath responsive, touchable, receipt-bearing contracts.
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
 * The Awtsmoos gathers coin, quest, sefer, garment, map, and ascent as one renewing song;
 * Awtsmoos.com reveals every authority receipt, then releases every listener before long.
 */

import { installAccessibilityStyles } from './AccessibilityStyles.js';
import { assembleGameplayPanels } from './GameplayPanelAssembly.js';
import { assembleGameplayRuntime } from './GameplayRuntimeAssembly.js';
import { installGameplaySpectralSurfaceStyle } from './GameplaySpectralSurfaceStyle.js';
import { installGameplayUiStyles } from './GameplayUiStyles.js';
import { installMinimalMeadowUiRepairStyles } from './MinimalMeadowUiRepairStyles.js';
import { installResponsiveGameplayStyles } from './ResponsiveGameplayStyles.js';

export class GameplayUiController {
	constructor(bus, options = {}) {
		const documentValue = options.document || globalThis.document;
		installGameplayUiStyles();
		installResponsiveGameplayStyles();
		installMinimalMeadowUiRepairStyles(documentValue);
		installAccessibilityStyles(documentValue);
		installGameplaySpectralSurfaceStyle(documentValue);
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
		this.listen('inventory:state', detail => {
			this.panels.notifyInventory(detail.open);
		});
		this.listen('quest:offer', detail => {
			this.panels.questOffer.open(detail.questId);
		});
		this.listen('quest:event', event => this.adventures.recordEvent(event));
		this.listen('inventory:add', detail => {
			this.inventory.add(detail.itemId, detail.quantity);
		});
		this.listen('inventory:equip', detail => {
			this.inventory.equip(detail.itemId);
		});
		this.listen('profile:synchronize', detail => {
			this.profile.synchronize(detail);
		});
	}

	listen(type, listener) {
		this.unsubscribers.push(this.bus.on(type, listener));
	}

	updatePosition(position) {
		this.panels.updatePosition(position);
	}

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

const PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map',
	'profile:toggle': 'profile',
	'questlog:toggle': 'quests',
	'tailor:toggle': 'tailor',
	'torah:toggle': 'torah',
	'vendor:toggle': 'vendor'
});
