// B"H
// Boruch Hashem
// Blessed is He
/** Harvested modifier RNA becomes declarative power without pretending local execution. */

import { createModifierDefinition } from "../../modifiers/createModifierDefinition.js";
import { createBlenderPropertySchema } from "./createBlenderPropertySchema.js";
import { blenderTypeIdentifier, normalizeBlenderIdentifier } from "./normalizeBlenderIdentifier.js";

export function createBlenderModifierDefinitionFromManifest(input, context = {}) {
	const nativeType = String(input?.nativeType ?? input?.identifier ?? "UnknownModifier");
	const category = normalizeBlenderIdentifier(input?.category ?? "general");
	const properties = (input?.properties ?? []).map(createBlenderPropertySchema);
	return createModifierDefinition({
		id: blenderTypeIdentifier("modifier", nativeType),
		version: "1.0.0",
		title: String(input?.name ?? nativeType),
		category: `blender.${category}`,
		domains: input?.domains ?? ["object"],
		status: "adapter-dependent",
		timeDependent: input?.timeDependent === true,
		topologyBehavior: input?.topologyBehavior ?? "preserve-or-report",
		parameters: Object.fromEntries(properties.map(property => [property.id, property])),
		metadata: {
			nativeType,
			blenderVersion: context.blenderVersion ?? null,
			category,
			properties,
			metadata: input?.metadata ?? {}
		}
	});
}
