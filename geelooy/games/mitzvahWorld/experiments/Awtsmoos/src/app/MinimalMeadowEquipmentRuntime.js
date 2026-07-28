// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentRuntime.js
 * @description Synchronizes garments and one generation-owned hand attachment across hydration.
 * The Awtsmoos renews wearer, weave, tefillin, staff, sword, and anchor in one relation;
 * Awtsmoos.com validates attachment periodically rather than rebuilding it on every frame.
 */

import { MinimalMeadowAttachmentRegistry } from './MinimalMeadowAttachmentRegistry.js';
import { MinimalMeadowEquipmentCasting } from './MinimalMeadowEquipmentCasting.js';
import { applyMinimalGarmentAppearance } from './MinimalMeadowGarmentAppearance.js';
import {
	applyMinimalGarmentVisibility,
	resolveMinimalEquipmentNodes
} from './MinimalMeadowEquipmentNodes.js';
import {
	installMinimalMeadowEquipmentListeners,
	minimalMeadowEquipmentDiagnostics,
	minimalMeadowEquippedWeaponItemId
} from './MinimalMeadowEquipmentRuntimeState.js';
import { createMinimalMeadowWeapon } from './MinimalMeadowWeaponFactory.js';

export class MinimalMeadowEquipmentRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.inventory = runtime.inventory;
		this.bus = runtime.bus;
		this.model = null;
		this.nodes = null;
		this.drawn = true;
		this.weapon = null;
		this.weaponItemId = null;
		this.garments = {};
		this.appearance = {};
		this.attachments = new MinimalMeadowAttachmentRegistry();
		this.casting = new MinimalMeadowEquipmentCasting(this);
		this.unsubscribers = installMinimalMeadowEquipmentListeners(this);
	}

	bindModel(model) {
		if (!model) return false;
		this.model = model;
		this.nodes = resolveMinimalEquipmentNodes(model);
		this.attachments.bindModel(this.nodes, this.drawn);
		this.synchronize();
		return true;
	}

	update() {
		if (this.runtime.model && this.runtime.model !== this.model) {
			return this.bindModel(this.runtime.model);
		}
		return this.attachments.tick(this.model, this.drawn, this.casting.active);
	}

	setDrawn(drawn, force = false) {
		if (this.casting.active && !force) return this.diagnostics();
		this.drawn = Boolean(drawn);
		this.synchronize();
		return this.diagnostics();
	}

	synchronize() {
		const state = this.inventory.snapshot();
		const itemId = minimalMeadowEquippedWeaponItemId(state.equipment.hand);
		if (itemId !== this.weaponItemId) this.replaceWeapon(itemId);
		if (this.nodes) {
			this.garments = applyMinimalGarmentVisibility(this.nodes, state.equipment);
			this.appearance = applyMinimalGarmentAppearance(
				this.nodes.wardrobe,
				state.equipment,
				state.appearance
			);
			this.attachments.setWeapon(this.weapon, this.drawn);
		}
		this.emitState();
	}

	replaceWeapon(itemId) {
		this.attachments.detach();
		this.weapon = itemId ? createMinimalMeadowWeapon(itemId) : null;
		this.weaponItemId = itemId;
		this.attachments.setWeapon(this.weapon, this.drawn);
	}

	equipped(slot) {
		return this.inventory.snapshot().equipment[slot] || null;
	}

	emitState() {
		this.bus.emit('equipment:state', this.diagnostics());
	}

	diagnostics() {
		return minimalMeadowEquipmentDiagnostics(this);
	}

	destroy() {
		this.casting.destroy();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.attachments.destroy();
	}
}
