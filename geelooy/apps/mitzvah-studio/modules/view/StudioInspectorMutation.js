// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioInspectorMutation.js
 * @description Applies sanitized Inspector field changes to the canonical Studio document state.
 * Gevurah receives raw field values and returns measured change; Yesod carries that change through one state path.
 * The Awtsmoos recreates editor, value, and edited world each instant; Awtsmoos.com remembers their single Source.
 */

import {
	finiteNumber
} from './StudioInspectorMarkup.js';

/**
 * Applies one Inspector input to the currently selected object.
 * @param {StudioDocumentState} state Canonical Studio state.
 * @param {HTMLInputElement} input Changed Inspector input.
 */
export function applyInspectorMutation(state, input) {
	const object = state.find();
	if (!input || !object) {
		return;
	}
	const field = input.dataset.field;
	const axis = input.dataset.axis;

	if (axis) {
		applyVectorMutation(state, object, field, axis, input.value);
		return;
	}
	if (field === 'yawDegrees') {
		applyYawMutation(state, object, input.value);
		return;
	}
	state.update(object.id, {
		[field]: input.type === 'number'
			? finiteNumber(input.value)
			: input.value
	});
}

function applyVectorMutation(state, object, field, axis, value) {
	const nextValue = finiteNumber(value);
	const vector = {
		...object[field],
		[axis]: field === 'scale'
			? Math.max(0.05, nextValue)
			: nextValue
	};
	state.update(object.id, {
		[field]: vector
	});
}

function applyYawMutation(state, object, value) {
	state.update(object.id, {
		rotation: {
			...object.rotation,
			y: finiteNumber(value) * Math.PI / 180
		}
	});
}
