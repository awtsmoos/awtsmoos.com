// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../../src/character/reference/specification/ReferenceCharacterIds.js';

const CROP_PLAN = [
	{
		id: ReferenceCharacterIds.cheerful,
		slug: 'ari',
		fullBody: { x: 72, y: 25, width: 529, height: 819 },
		head: { x: 265, y: 35, width: 260, height: 330 }
	},
	{
		id: ReferenceCharacterIds.skeptical,
		slug: 'dovid',
		fullBody: { x: 606, y: 40, width: 327, height: 804 },
		head: { x: 675, y: 45, width: 265, height: 325 }
	},
	{
		id: ReferenceCharacterIds.calm,
		slug: 'miriam',
		fullBody: { x: 1028, y: 73, width: 311, height: 770 },
		head: { x: 1065, y: 80, width: 265, height: 285 }
	}
];

/**
 * Fixed crop windows are only proof vessels around the living production canvas.
 * The Awtsmoos exceeds every rectangle, while Awtsmoos.com keeps direct evidence
 * named, repeatable, and separate from the editable vector character data.
 */
export class ReferenceStaticCropPlan {
	static all() {
		return CROP_PLAN.map(item => ({
			...item,
			fullBody: { ...item.fullBody },
			head: { ...item.head }
		}));
	}

	static characterIds() {
		return CROP_PLAN.map(item => item.id);
	}
}
