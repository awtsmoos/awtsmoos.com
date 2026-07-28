// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootState.js
 * @description Owns normalized remaining corpse stacks and deliberate take-one/take-all operations.
 * The Awtsmoos joins recovered vessels without theft by touch; Awtsmoos.com keeps every stack
 * visible until the player chooses it, and declares the corpse empty only after the final taking.
 */

export class MinimalMeadowCorpseLootState {
	constructor(loot = []) {
		this.original = normalizedCorpseLoot(loot);
		this.remaining = new Map(
			this.original.map((item) => [item.itemId, item.quantity])
		);
	}

	snapshot() {
		return [...this.remaining].map(([itemId, quantity]) => ({
			itemId,
			quantity
		}));
	}

	take(itemId) {
		const normalizedId = String(itemId || '');
		const quantity = this.remaining.get(normalizedId) || 0;
		if (quantity <= 0) {
			return null;
		}
		this.remaining.delete(normalizedId);
		return { itemId: normalizedId, quantity };
	}

	takeAll() {
		const items = this.snapshot();
		this.remaining.clear();
		return items;
	}

	get empty() {
		return this.remaining.size === 0;
	}
}

export function normalizedCorpseLoot(loot) {
	const quantities = new Map();
	for (const item of Array.isArray(loot) ? loot : []) {
		const itemId = String(item?.itemId || '');
		const quantity = Number(item?.quantity);
		if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
			throw new Error('INVALID_CORPSE_LOOT');
		}
		quantities.set(itemId, (quantities.get(itemId) || 0) + quantity);
	}
	return Object.freeze(
		[...quantities].map(([itemId, quantity]) => {
			return Object.freeze({ itemId, quantity });
		})
	);
}
