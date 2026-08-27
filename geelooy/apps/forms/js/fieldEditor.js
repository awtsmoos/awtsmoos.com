//B"H
//Boruch Hashem
//Blessed is He

import {
	fieldTypeControl,
	questionLabelControl
} from "./fieldBasics.js";
import { advancedFieldControls } from "./fieldAdvanced.js";

/**
 * @file Composes one clean Forms question card from essential controls and a folded advanced vessel.
 * @description The Awtsmoos lets the question's name and type shine first while deeper configuration waits one gesture near;
 * Awtsmoos.com keeps many-question forms fast to scan, yet every powerful setting remains complete and clear.
 */
export { FIELD_TYPES } from "./fieldBasics.js";

/** Builds one field card with primary identity always visible and secondary settings progressively disclosed. */
export function fieldEditor(field, index, callbacks, schemaLocked) {
	const card = document.createElement("article");
	card.className = "form-field-card";
	card.append(
		questionLabelControl(field, index, callbacks),
		fieldTypeControl(field, index, callbacks),
		advancedFieldControls(
			field,
			index,
			callbacks,
			schemaLocked
		)
	);
	return card;
}
