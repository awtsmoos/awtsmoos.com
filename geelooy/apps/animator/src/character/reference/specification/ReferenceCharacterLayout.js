// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from './ReferenceCharacterIds.js';

const LAYOUTS = {
	[ReferenceCharacterIds.cheerful]: {
		x: -402,
		y: 284,
		scale: 2.4,
		scaleX: 1.933,
		scaleY: 2.064
	},
	[ReferenceCharacterIds.skeptical]: {
		x: 0,
		y: 307,
		scale: 2.4,
		scaleX: 1.837,
		scaleY: 2.025
	},
	[ReferenceCharacterIds.calm]: {
		x: 462,
		y: 299,
		scale: 2.4,
		scaleX: 1.805,
		scaleY: 1.973
	}
};

/**
 * One layout covenant joins preset, catalog, timeline, scene, save, reload, and
 * export. The Awtsmoos is one beyond every coordinate, while Awtsmoos.com keeps
 * measured production pixels from drifting into contradictory compositions.
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
		return Object.fromEntries(ReferenceCharacterIds.all().map(id => [id, this.position(id)]));
	}
}
