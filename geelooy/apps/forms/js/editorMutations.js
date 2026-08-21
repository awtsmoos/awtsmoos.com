//B"H
//Boruch Hashem
//Blessed is He

import {
	isChoiceType,
	newField
} from "./model.js";

/**
 * @file Owns bounded Forms editor state transitions while DOM rendering remains a separate vessel.
 * @description The Awtsmoos lets question identity remain stable while labels, types, and order move in measured light;
 * Awtsmoos.com keeps historical schema safety explicit so editor gestures cannot secretly rewrite yesterday's sight.
 */

/** Patches one field without changing its stable identifier. */
export function patchField(form, index, patch) {
	const field = form.fields?.[index];
	if (!field) {
		return false;
	}
	form.fields[index] = {
		...field,
		...patch,
		id: field.id
	};
	return true;
}

/** Changes field type while adding/removing option metadata according to the new type. */
export function changeFieldType(form, index, type) {
	const field = form.fields?.[index];
	if (!field) {
		return false;
	}
	const next = {
		...field,
		type
	};
	if (isChoiceType(type)) {
		next.options = Array.isArray(field.options) && field.options.length
			? [...field.options]
			: ["Option 1", "Option 2"];
	} else {
		delete next.options;
	}
	form.fields[index] = next;
	return true;
}

/** Moves one field by a bounded delta before response schema becomes locked. */
export function moveField(form, index, delta, schemaLocked) {
	if (schemaLocked) {
		return false;
	}
	const target = index + delta;
	if (index < 0 || target < 0 || target >= form.fields.length) {
		return false;
	}
	const [field] = form.fields.splice(index, 1);
	form.fields.splice(target, 0, field);
	return true;
}

/** Removes one field only before responses and never removes the final required definition field. */
export function removeField(form, index, schemaLocked) {
	if (schemaLocked || form.fields.length <= 1) {
		return false;
	}
	if (index < 0 || index >= form.fields.length) {
		return false;
	}
	form.fields.splice(index, 1);
	return true;
}

/** Appends one new question while respecting the server's sixty-four-field limit. */
export function appendField(form, type = "shortText") {
	if ((form.fields || []).length >= 64) {
		return false;
	}
	form.fields.push(newField(type));
	return true;
}
