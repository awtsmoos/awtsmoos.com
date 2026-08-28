//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDoorwayPortalFields.js
 * @description Reveals the canonical doorway dimensions and placement knobs as typed Portal inspector data while construction remains owned by DoorWallSystem.
 * Gevurah measures threshold, frame, and hinge while Tiferes keeps the visible authoring surface calm; the Awtsmoos recreates opening and wall before either can claim a border,
 * and Awtsmoos.com lets exact numeric intent become discoverable without duplicating doorway geometry, runtime motion, or renderer law inside the interface.
 */

import {
	createPortalField
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	TALL_DOORWAY_SPEC
} from '../../world/DoorwaySpecs.js';

/**
 * @description Creates typed common and advanced fields for the doorway options already accepted directly by the canonical Portal adapter.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen Portal field descriptors for dimensions, placement, opening angle, and stable generated IDs.
 */
export function createMitzvahWorldDoorwayPortalFields() {
	return Object.freeze([
		createPortalField(numberField('doorW', 'Door Width', TALL_DOORWAY_SPEC.doorW, 'Dimensions', 0.5, 0.05)),
		createPortalField(numberField('doorH', 'Door Height', TALL_DOORWAY_SPEC.doorH, 'Dimensions', 1, 0.05)),
		createPortalField(numberField('wallW', 'Wall Width', TALL_DOORWAY_SPEC.wallW, 'Dimensions', 1, 0.05)),
		createPortalField(numberField('wallH', 'Wall Height', TALL_DOORWAY_SPEC.wallH, 'Dimensions', 1, 0.05)),
		createPortalField(numberField('wallT', 'Wall Thickness', TALL_DOORWAY_SPEC.wallT, 'Dimensions', 0.1, 0.01)),
		createPortalField(numberField('openAngle', 'Open Angle', TALL_DOORWAY_SPEC.openAngle, 'Motion', -6.283, 0.01, 6.283)),
		createPortalField(numberField('x', 'World X', TALL_DOORWAY_SPEC.x, 'Placement', null, 0.1, null, 'advanced')),
		createPortalField(numberField('z', 'World Z', TALL_DOORWAY_SPEC.z, 'Placement', null, 0.1, null, 'advanced')),
		createPortalField({
			description: 'Optional stable semantic identifier for the generated door definition.',
			group: 'Identity',
			key: 'doorId',
			kind: 'text',
			label: 'Door ID',
			level: 'advanced'
		})
	]);
}

/**
 * @description Builds one reusable numeric field record while keeping the exported field collection declarative and readable.
 * @param {string} key Portal option key accepted by the doorway compiler.
 * @param {string} label Human-facing control label.
 * @param {number} defaultValue Canonical doorway default value.
 * @param {string} group Progressive-disclosure field group.
 * @param {number|null} min Optional minimum value.
 * @param {number} step Suggested numeric control increment.
 * @param {number|null} [max=null] Optional maximum value.
 * @param {'common'|'advanced'} [level='common'] Progressive-disclosure visibility level.
 * @returns {object} Portal field construction record.
 */
function numberField(key, label, defaultValue, group, min, step, max = null, level = 'common') {
	return {
		defaultValue,
		description: `${label} passed directly into the canonical doorway specification before renderer-neutral planning.`,
		group,
		key,
		kind: 'number',
		label,
		level,
		max,
		min,
		step
	};
}
