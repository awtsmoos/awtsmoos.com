// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayPanelSuite.js
 * @description Composes gameplay panels through one accessible coordinator and canonical map state.
 * The Awtsmoos gathers quest, Torah, Bag, profile, market, tailor, and map in one luminous order;
 * Awtsmoos.com opens each finite vessel without confusing the document with its living window border.
 */

import { ClothingMerchantPanel } from './ClothingMerchantPanel.js';
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
		this.document = options.document || globalThis.document;
		this.environment = options.environment
			|| this.document?.defaultView
			|| globalThis;
		this.adventures = options.adventures;
		this.inventory = options.inventory;
		this.profile = options.profile;
		this.inventoryPanel = options.inventoryPanel;
		this.coordinator = new PanelCoordinator(this.environment);
		this.questLog = new QuestLogPanel(this.adventures);
		this.questOffer = new QuestOfferPanel(this.adventures, this.environment);
		this.minimap = new WorldMinimap(
			this.adventures,
			this.document,
			this.environment
		);
		this.torah = new TorahLibraryPanel(this.inventory, {
			getFocus: options.getTorahFocus,
			onAssign: options.onAssignAbility,
			onUse: options.onUsePassage
		});
		this.profilePanel = new ShliachProfilePanel(this.profile, {
			onActivate: options.onActivatePowerup,
			onAllocate: options.onAllocateAttribute
		});
		this.vendor = new VendorPanel(this.inventory, {
			onBuy: options.onBuyItem
		});
		this.tailor = new ClothingMerchantPanel(this.inventory, {
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
		this.coordinator.register('bag', this.inventoryPanel, { focus: false });
		this.coordinator.register('profile', this.profilePanel);
		this.coordinator.register('vendor', this.vendor);
		this.coordinator.register('tailor', this.tailor);
		this.coordinator.register('map', {
			root: this.minimap.root,
			setOpen: open => this.minimap.setExpanded(open)
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

	snapshot() {
		return {
			tailorOpen: !this.tailor.root.hidden,
			torahLibrary: this.torah.snapshot()
		};
	}

	destroy() {
		this.coordinator.destroy();
		const panels = [
			this.questLog,
			this.questOffer,
			this.minimap,
			this.torah,
			this.profilePanel,
			this.vendor,
			this.tailor,
			this.tracker,
			this.ribbon
		];
		for (const panel of panels) {
			panel.destroy();
		}
	}
}
