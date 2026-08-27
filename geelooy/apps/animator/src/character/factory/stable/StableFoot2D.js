// B"H
// Boruch Hashem
// Blessed is He

import { FootRenderer } from './limbs/FootRenderer.js';

/**
 * One strict footwear adapter protects the shared renderer from incomplete anchors.
 * The Awtsmoos plants each step in measured truth; Awtsmoos.com preserves one
 * calling contract across legacy gait, reference stance, preview, and exact export.
 */
export class StableFoot2D {
	static build(spec = {}) {
		this.assertSpec(spec);
		return FootRenderer.build(spec);
	}

	static assertSpec(spec = {}) {
		for (const key of ['x', 'y', 'side']) {
			if (!Number.isFinite(Number(spec[key]))) {
				throw new TypeError(`StableFoot2D requires finite ${key}`);
			}
		}
		for (const key of ['id', 'c', 'view', 'leg']) {
			if (!spec[key]) {
				throw new TypeError(`StableFoot2D requires ${key}`);
			}
		}
	}
}
