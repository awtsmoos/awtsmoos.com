// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayPanelSuite.js
 * @description Composes major sheets, modal offers, map, tracker, ribbon, and coordination.
 * The Awtsmoos renews many interfaces without division; Awtsmoos.com places each major
 * vessel behind one doorway while persistent guidance stays light and visible.
 */

import { PanelCoordinator } from './PanelCoordinator.js';
import { QuestLogPanel } from './QuestLogPanel.js';
import { QuestOfferPanel } from './QuestOfferPanel.js';
import { QuestTracker } from './QuestTracker.js';
import { ShliachProfilePanel } from './ShliachProfilePanel.js';
import { StatusRibbon } from './StatusRibbon.js';
import { TorahLibraryPanel } from './TorahLibraryPanel.js';
import { VendorPanel } from './VendorPanel.js';
import { WorldMinimap } from './WorldMinimap.js';

export class GameplayPanelSuite {
	constructor(options) {
		this.adventures = options.adventures;
		this.inventory = options.inventory;
		this.profile = options.profile;
		this.inventoryPanel = options.inventoryPanel;
		this.coordinator = new PanelCoordinator();
		this.questLog = new QuestLogPanel(this.adventures);
		this.questOffer = new QuestOfferPanel(this.adventures);
		this.minimap = new WorldMinimap(this.adventures);
		this.torah = new TorahLibraryPanel(this.inventory, {
			onUse: options.onUsePassage
		});
		this.profilePanel = new ShliachProfilePanel(this.profile, {
			onActivate: options.onActivatePowerup,
			onAllocate: options.onAllocateAttribute
		});
		this.vendor = new VendorPanel(this.inventory, {
			onBuy: options.onBuyItem
		});
		this.tracker = new QuestTracker(
			this.adventures,
			() => this.coordinator.open('quests')
		);
		this.ribbon = new StatusRibbon(this.profile);
		this.registerPanels();
	}

	registerPanels() {
		this.coordinator.register('quests', this.questLog);
		this.coordinator.register('torah', this.torah);
		this.coordinator.register('bag', this.inventoryPanel);
		this.coordinator.register('profile', this.profilePanel);
		this.coordinator.register('vendor', this.vendor);
		this.coordinator.register('map', {
			setOpen: open => {
				this.minimap.root.dataset.expanded = String(Boolean(open));
			}
		});
	}

	toggle(panelId) {
		return this.coordinator.toggle(panelId);
	}

	notifyInventory(open) {
		this.coordinator.notify('bag', open);
	}

	updatePosition(position) {
		this.minimap.setPosition(position);
	}

	destroy() {
		this.coordinator.destroy();
		this.questLog.destroy();
		this.questOffer.destroy();
		this.minimap.destroy();
		this.torah.destroy();
		this.profilePanel.destroy();
		this.vendor.destroy();
		this.tracker.destroy();
		this.ribbon.destroy();
	}
}
