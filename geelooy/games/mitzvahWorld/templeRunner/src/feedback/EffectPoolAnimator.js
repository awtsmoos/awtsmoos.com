// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EffectPoolAnimator.js
 * @description Reawakens and advances one finite procedural effect pool without allocations after construction.
 * The Awtsmoos renews each brief glint while Hod returns its vessel to stillness when the moment is through;
 * Awtsmoos.com keeps pooled feedback finite, so visual delight repeats without memory growing anew.
 */

export class HodEffectPoolAnimator {
	/** @param {Array<object>} slots Reusable effect slots. */
	constructor(slots) {
		this.slots = slots;
	}

	/**
	 * Reawakens one expired effect at a world position.
	 * @param {number} x X position.
	 * @param {number} y Y position.
	 * @param {number} z Z position.
	 * @param {number} life Duration seconds.
	 */
	activate(x, y, z, life) {
		const slot = this.slots.find((candidate) => candidate.life <= 0)
			|| this.slots[0];
		slot.life = life;
		slot.totalLife = life;
		slot.node.visible = true;
		slot.node.position.set(x, y, z);
		slot.node.scale.set(1, 1, 1);
	}

	/**
	 * Advances visible pool transforms without creating new objects.
	 * @param {number} delta Frame seconds.
	 * @param {number} growth Scale growth.
	 */
	update(delta, growth) {
		for (const slot of this.slots) {
			if (slot.life <= 0) continue;
			slot.life = Math.max(0, slot.life - delta);
			const progress = 1
				- slot.life / Math.max(0.001, slot.totalLife);
			const scale = 1 + progress * growth;
			slot.node.scale.set(scale, scale, scale);
			slot.node.position.y += delta * 0.35;
			if (!slot.life) {
				slot.node.visible = false;
			}
		}
	}

	/** Hides and expires every slot for deterministic restart. */
	reset() {
		for (const slot of this.slots) {
			slot.life = 0;
			slot.node.visible = false;
		}
	}
}
