// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureVisibilityField.js
 * @description Applies real distance culling to every isolated tree, flower, bush, and rock scene.
 * The Awtsmoos reveals what belongs near the traveler and folds distant vessels from the eye;
 * Awtsmoos.com counts each visible form, so mobile budgets become behavior rather than a lie.
 */

export class NatureVisibilityField {
	constructor(instances, budget, originProvider) {
		this.instances = instances;
		this.cullDistanceSquared = budget.cullDistance ** 2;
		this.originProvider = originProvider || (() => ({ x: 0, y: 0, z: 0 }));
		this.visible = instances.length;
	}

	/** Updates scene visibility from the live traveler or camera position. */
	update() {
		const origin = this.originProvider() || {};
		const x = finite(origin.x);
		const z = finite(origin.z);
		let visible = 0;
		for (const instance of this.instances) {
			const placement = instance.placement;
			const dx = placement.x - x;
			const dz = placement.z - z;
			const withinRange = dx * dx + dz * dz <= this.cullDistanceSquared;
			instance.scene.visible = withinRange;
			if (withinRange) visible += 1;
		}
		this.visible = visible;
		return visible;
	}

	snapshot() {
		return Object.freeze({
			culled: this.instances.length - this.visible,
			total: this.instances.length,
			visible: this.visible
		});
	}
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
