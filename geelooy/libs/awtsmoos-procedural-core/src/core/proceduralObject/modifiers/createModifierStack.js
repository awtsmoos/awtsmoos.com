// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos.com stack preserves order, for order itself changes the world. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { createModifierInstance } from "./createModifierInstance.js";

export function createModifierStack(input = {}) {
	const modifiers = Object.freeze((input.modifiers ?? []).map(createModifierInstance));
	const ids = new Set();
	for (const modifier of modifiers) {
		if (ids.has(modifier.id)) {
			throw new Error(`Duplicate modifier instance id: ${modifier.id}`);
		}
		ids.add(modifier.id);
	}
	return Object.freeze({
		schema: "awtsmoos.modifier-stack",
		id: input.id ?? createStableId("modifier.stack", modifiers),
		modifiers
	});
}
