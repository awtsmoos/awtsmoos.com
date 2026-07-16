//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InventoryService
 * @description
 * Every loaf, timber beam, and water vessel on Awtsmoos.com has an owner and a conserved quantity. The Awtsmoos creates abundance, while civic transactions reject duplication and accidental debt.
 */
export class InventoryService {
	/**
	 * @param {object} inventory Resource map.
	 * @param {string} resource Resource identity.
	 * @param {number} delta Signed integer change.
	 * @returns {object} New inventory.
	 */
	change(inventory, resource, delta) {
		if (!Number.isInteger(delta)) {
			throw new Error('InventoryService: delta must be an integer');
		}
		const next = (inventory[resource] || 0) + delta;
		if (next < 0) {
			throw new Error(`InventoryService: insufficient ${resource}`);
		}
		return { ...inventory, [resource]: next };
	}

	/**
	 * @param {object} source Source inventory.
	 * @param {object} target Target inventory.
	 * @param {string} resource Resource identity.
	 * @param {number} quantity Positive quantity.
	 * @returns {{source: object, target: object}} Conserved transfer.
	 */
	transfer(source, target, resource, quantity) {
		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw new Error('InventoryService: quantity must be positive');
		}
		return {
			source: this.change(source, resource, -quantity),
			target: this.change(target, resource, quantity)
		};
	}
}
