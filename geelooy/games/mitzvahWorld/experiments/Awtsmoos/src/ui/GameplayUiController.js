// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayUiController.js
 * @description Coordinates stores, panels, Shlichus events, Torah abilities, and physical attacks.
 * The Awtsmoos renews quest, learning, commerce, and strength beneath one event vessel;
 * Awtsmoos.com keeps both Torah-light and staff strikes transactional, bounded, and directly known.
 */

import { AdventureStore } from '../gameplay/AdventureStore.js';
import { PlayerMeleeController } from '../gameplay/combat/PlayerMeleeController.js';
import { TorahCombatController } from '../gameplay/combat/TorahCombatController.js';
import { InventoryStore } from '../gameplay/InventoryStore.js';
import { ShliachProfileStore } from '../gameplay/ShliachProfileStore.js';
import { GameplayActionGateway } from './GameplayActionGateway.js';
import { GameplayPanelSuite } from './GameplayPanelSuite.js';
import { installGameplayUiStyles } from './GameplayUiStyles.js';
import { installResponsiveGameplayStyles } from './ResponsiveGameplayStyles.js';

export class GameplayUiController {
	constructor(bus, options = {}) {
		installGameplayUiStyles();
		installResponsiveGameplayStyles();
		this.bus = bus;
		this.adventures = options.adventures || new AdventureStore();
		this.inventory = options.inventory || new InventoryStore();
		this.profile = options.profile || new ShliachProfileStore({
			inventory: this.inventory
		});
		this.gateway = new GameplayActionGateway({
			actions: options.actions,
			inventory: this.inventory,
			profile: this.profile
		});
		this.combat = options.combat || new TorahCombatController({
			bus,
			clock: options.clock,
			focus: options.focus,
			inventory: this.inventory,
			profile: this.profile
		});
		this.melee = options.melee || new PlayerMeleeController({
			attack: options.meleeAttack,
			bus,
			clock: options.clock
		});
		this.panels = new GameplayPanelSuite({
			adventures: this.adventures,
			inventory: this.inventory,
			inventoryPanel: options.inventoryPanel,
			onActivatePowerup: id => this.gateway.activatePowerup(id),
			onAllocateAttribute: (id, points) => this.gateway.allocateAttribute(id, points),
			onBuyItem: (id, quantity) => this.gateway.buyItem(id, quantity),
			onUsePassage: passage => this.combat.usePassage(passage),
			profile: this.profile
		});
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
			adventures: this.adventures.snapshot(),
			combat: this.combat.snapshot(),
			inventory: this.inventory.snapshot(),
			melee: this.melee.snapshot(),
			profile: this.profile.snapshot()
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
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
	'torah:toggle': 'torah',
	'vendor:toggle': 'vendor'
});
