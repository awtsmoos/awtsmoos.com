// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentRuntime.js
 * @description Synchronizes inventory garments and one procedural weapon with the visible Chossid.
 * The Awtsmoos renews wearer and garment in one present act; Awtsmoos.com lets equip, unequip,
 * draw, sheath, GLB rebinding, exact bones, and visible child meshes share one authoritative state.
 */

import {
	applyMinimalGarmentVisibility,
	resolveMinimalEquipmentNodes
} from './MinimalMeadowEquipmentNodes.js?v=20260724-meadow-21';
import {
	attachMinimalWeapon,
	detachMinimalWeapon
} from './MinimalMeadowWeaponAttachment.js?v=20260724-meadow-21';
import { createMinimalMeadowWeapon } from './MinimalMeadowWeaponFactory.js?v=20260724-meadow-21';

export class MinimalMeadowEquipmentRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.inventory = runtime.inventory;
		this.bus = runtime.bus;
		this.model = null;
		this.nodes = null;
		this.drawn = false;
		this.weapon = null;
		this.weaponItemId = null;
		this.garments = {};
		this.unsubscribers = [
			this.inventory.onChange(() => this.synchronize()),
			this.bus.on('equipment:draw', () => this.setDrawn(true)),
			this.bus.on('equipment:sheath', () => this.setDrawn(false)),
			this.bus.on('equipment:toggle-draw', () => this.setDrawn(!this.drawn))
		];
	}

	bindModel(model) {
		if (!model) return;
		detachMinimalWeapon(this.weapon);
		this.model = model;
		this.nodes = resolveMinimalEquipmentNodes(model);
		this.synchronize();
	}

	setDrawn(drawn) {
		this.drawn = Boolean(drawn);
		this.synchronize();
	}

	synchronize() {
		if (!this.nodes) return;
		const state = this.inventory.snapshot();
		this.garments = applyMinimalGarmentVisibility(this.nodes, state.equipment);
		const itemId = weaponItemId(state.equipment.hand);
		if (itemId !== this.weaponItemId) this.replaceWeapon(itemId);
		if (this.weapon) attachMinimalWeapon(this.weapon, this.nodes, this.drawn);
		this.bus.emit('equipment:state', this.diagnostics());
	}

	replaceWeapon(itemId) {
		detachMinimalWeapon(this.weapon);
		this.weapon = itemId ? createMinimalMeadowWeapon(itemId) : null;
		this.weaponItemId = itemId;
	}

	diagnostics() {
		return {
			drawn: this.drawn,
			garments: { ...this.garments },
			handBone: this.nodes?.rightHand?.name || null,
			model: this.model?.name || null,
			spineBone: this.nodes?.spine?.name || null,
			weaponAttachment: this.weapon?.userData?.attachment || 'none',
			weaponItemId: this.weaponItemId
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		detachMinimalWeapon(this.weapon);
	}
}

function weaponItemId(itemId) {
	return ['wooden-staff', 'spark-blade'].includes(itemId) ? itemId : null;
}
