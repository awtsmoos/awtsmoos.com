// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentRuntime.js
 * @description Synchronizes authoritative equipment with garments, weapons, hydration, and casting.
 * The Awtsmoos renews wearer, staff, sword, hand, and back in one present relation;
 * Awtsmoos.com preserves one weapon object and delegates cast timing to its focused vessel.
 */

import { MinimalMeadowEquipmentCasting } from './MinimalMeadowEquipmentCasting.js';
import { applyMinimalGarmentVisibility, resolveMinimalEquipmentNodes } from './MinimalMeadowEquipmentNodes.js';
import { attachMinimalWeapon, detachMinimalWeapon } from './MinimalMeadowWeaponAttachment.js';
import { createMinimalMeadowWeapon } from './MinimalMeadowWeaponFactory.js';

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
		this.casting = new MinimalMeadowEquipmentCasting(this);
		this.unsubscribers = this.installListeners();
	}

	installListeners() {
		return [
			this.inventory.onChange(() => this.synchronize()),
			this.bus.on('equipment:draw', () => this.setDrawn(true)),
			this.bus.on('equipment:sheath', () => this.setDrawn(false)),
			this.bus.on('equipment:toggle-draw', () => this.setDrawn(!this.drawn)),
			this.bus.on('combat:cast-start', () => this.casting.begin()),
			this.bus.on('combat:cast-launch', () => this.casting.launch()),
			this.bus.on('combat:cast-cancel', () => this.casting.cancel())
		];
	}

	bindModel(model) {
		if (!model) return;
		detachMinimalWeapon(this.weapon);
		this.model = model;
		this.nodes = resolveMinimalEquipmentNodes(model);
		this.synchronize();
	}

	setDrawn(drawn, force = false) {
		if (this.casting.active && !force) return this.diagnostics();
		this.drawn = Boolean(drawn);
		this.synchronize();
		return this.diagnostics();
	}

	synchronize() {
		const state = this.inventory.snapshot();
		const itemId = equippedWeaponItemId(state.equipment.hand);
		if (itemId !== this.weaponItemId) this.replaceWeapon(itemId);
		if (this.nodes) {
			this.garments = applyMinimalGarmentVisibility(this.nodes, state.equipment);
			if (this.weapon) attachMinimalWeapon(this.weapon, this.nodes, this.drawn);
		}
		this.emitState();
	}

	replaceWeapon(itemId) {
		detachMinimalWeapon(this.weapon);
		this.weapon = itemId ? createMinimalMeadowWeapon(itemId) : null;
		this.weaponItemId = itemId;
	}

	emitState() {
		this.bus.emit('equipment:state', this.diagnostics());
	}

	diagnostics() {
		return {
			casting: this.casting.active,
			drawn: this.drawn,
			garments: { ...this.garments },
			handBone: this.nodes?.rightHand?.name || this.nodes?.leftHand?.name || null,
			model: this.model?.name || null,
			spineBone: this.nodes?.spine?.name || null,
			weaponAttachment: this.weapon?.userData?.attachment || 'none',
			weaponItemId: this.weaponItemId
		};
	}

	destroy() {
		this.casting.destroy();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		detachMinimalWeapon(this.weapon);
	}
}

function equippedWeaponItemId(itemId) {
	return ['wooden-staff', 'spark-blade'].includes(itemId) ? itemId : null;
}
