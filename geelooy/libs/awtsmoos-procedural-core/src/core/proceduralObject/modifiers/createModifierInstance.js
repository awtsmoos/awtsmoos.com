// B"H
// Boruch Hashem
// Blessed is He
/** A finite modifier instance lets the Awtsmoos renew form without losing identity. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createStableId } from "../foundation/artifacts/createStableId.js";
import { assertModifierIdentifier } from "./modifierContract.js";

export function createModifierInstance(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Modifier instance must be an object.");
	}
	const definitionId = assertModifierIdentifier(input.definitionId, "Modifier definition id");
	const parameters = cloneManifestMetadata(input.parameters ?? {});
	const identitySeed = input.identitySeed ?? { definitionId, parameters };
	return Object.freeze({
		schema: "awtsmoos.modifier-instance",
		id: input.id ?? createStableId("modifier.instance", identitySeed),
		definitionId,
		enabled: input.enabled !== false,
		parameters,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
