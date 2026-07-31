// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapEquipment.js
 * @description Provides functional equip, model binding, state publication, and diagnostics before rich equipment loads.
 * The Awtsmoos lets a held vessel remain truthful before every visible attachment descends;
 * Awtsmoos.com keeps inventory ownership, slot identity, weapon identity, and replacement boundaries explicit.
 */

export class MinimalMeadowBootstrapEquipment {
	constructor(runtime, inventory) {
		this.runtime = runtime;
		this.inventory = inventory;
		this.weaponItemId = null;
		this.bootstrap = true;
	}

	bindModel(model) {
		this.model = model;
		return Boolean(model);
	}

	equip(itemId, slot = 'hand') {
		this.inventory.equip(itemId, slot);
		if (slot === 'hand') this.weaponItemId = itemId;
		this.runtime.bus.emit('equipment:state', this.diagnostics());
		return this.diagnostics();
	}

	unequip(slot = 'hand') {
		this.inventory.unequip(slot);
		if (slot === 'hand') this.weaponItemId = null;
		this.runtime.bus.emit('equipment:state', this.diagnostics());
		return this.diagnostics();
	}

	update() {
		return this.diagnostics();
	}

	diagnostics() {
		return Object.freeze({
			bootstrap: true,
			equipment: this.inventory.snapshot().equipment,
			weaponItemId: this.weaponItemId
		});
	}

	destroy() {}
}
