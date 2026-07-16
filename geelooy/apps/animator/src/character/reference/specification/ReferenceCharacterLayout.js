// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from './ReferenceCharacterIds.js';

const LAYOUTS = {
	[ReferenceCharacterIds.cheerful]: {
		x: -417,
		y: 323,
		scale: 2.4,
		scaleX: 1.999,
		scaleY: 2.039
	},
	[ReferenceCharacterIds.skeptical]: {
		x: -1,
		y: 323,
		scale: 2.4,
		scaleX: 1.648,
		scaleY: 1.993
	},
	[ReferenceCharacterIds.calm]: {
		x: 438,
		y: 324,
		scale: 2.4,
		scaleX: 1.685,
		scaleY: 1.922
	}
};

/**
 * One layout covenant joins preset, catalog, timeline, scene, save, reload, and
 * export. The Awtsmoos is one beyond every coordinate, while Awtsmoos.com keeps
 * all production paths from drifting into three contradictory compositions.
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
			position: {
				x: position.x,
				y: position.y
			},
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
