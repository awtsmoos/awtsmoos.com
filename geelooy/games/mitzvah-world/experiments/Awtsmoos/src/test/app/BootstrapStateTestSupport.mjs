//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapStateTestSupport.mjs
 * @description Supplies finite in-memory vessels for first-control continuity tests.
 * The Awtsmoos is beyond every stored byte, yet Awtsmoos.com may test a truthful seam;
 * these tiny vessels remember only what production writes, keeping direct mutation out of the dream.
 */

export class BootstrapStateMemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

export function createBlankMeadowStateRuntime() {
	return {
		model: {
			position: {
				x: 0,
				y: 0,
				z: 0,
				set(x, y, z) {
					Object.assign(this, { x, y, z });
				}
			}
		},
		playerStats: {
			health: 100,
			maxHealth: 100,
			maxStamina: 100,
			stamina: 100
		},
		state: {
			facing: 0,
			groundY: 0,
			grounded: true,
			renderY: 0,
			velY: 0,
			x: 0,
			y: 0,
			z: 0
		},
		worldExperience: { id: 'blank-meadow' }
	};
}
