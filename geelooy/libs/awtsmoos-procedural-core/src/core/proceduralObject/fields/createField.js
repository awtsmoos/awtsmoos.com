// B"H
// Boruch Hashem
// Blessed is He
/** A field is an immutable promise of influence renewed at every sample. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { FIELD_KINDS, FIELD_VALUE_TYPES, assertFieldChoice } from "./fieldContract.js";

export function createField(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Field input must be an object.");
	}
	const kind = assertFieldChoice(input.kind, FIELD_KINDS, "field kind");
	const valueType = assertFieldChoice(input.valueType ?? "scalar", FIELD_VALUE_TYPES, "field value type");
	const children = Object.freeze((input.children ?? []).map(createField));
	const parameters = cloneManifestMetadata(input.parameters ?? {});
	return Object.freeze({
		schema: "awtsmoos.field",
		id: input.id ?? createStableId("field", { kind, valueType, parameters, children }),
		kind,
		valueType,
		parameters,
		children
	});
}
