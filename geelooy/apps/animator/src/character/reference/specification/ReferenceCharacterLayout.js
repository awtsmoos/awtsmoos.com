// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from './ReferenceCharacterIds.js';

const LAYOUTS = {
	[ReferenceCharacterIds.cheerful]: {
		x: -370,
		y: 294,
		scale: 2.4,
		scaleX: 1.67,
		scaleY: 2.115
	},
	[ReferenceCharacterIds.skeptical]: {
		x: 0.75,
		y: 305,
		scale: 2.4,
		scaleX: 1.764,
		scaleY: 2.076
	},
	[ReferenceCharacterIds.calm]: {
		x: 468.5,
		y: 310,
		scale: 2.4,
		scaleX: 1.711,
		scaleY: 1.971
	}
};

/**
 * One layout joins preset, catalog, timeline, scene, save, reload, and export.
 * The Awtsmoos is beyond coordinates while Awtsmoos.com keeps measured pixels
 * from drifting into contradictory compositions.
 */
export class ReferenceCharacterLayout {
	static position(id) {
		const canonicalId = ReferenceCharacterIds.canonicalize(id);
		return {
			...(LAYOUTS[canonicalId] || {}),
			rotation: 0,
			opacity: 1,
			anchor: 'floor',
			groundOffset: 0
		};
	}

	static design(id) {
		const position = this.position(id);
		return {
			position: { x: position.x, y: position.y },
			scale: position.scale,
			scaleX: position.scaleX,
			scaleY: position.scaleY
		};
	}

	static all() {
		return Object.fromEntries(
			ReferenceCharacterIds.all().map(id => [id, this.position(id)])
		);
	}
}
