// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos.com definition separates declared power from executable proof. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../foundation/canonical/index.js";
import {
	MODIFIER_EXECUTION_STATUSES,
	assertModifierChoice,
	assertModifierIdentifier,
	assertModifierVersion,
	normalizeModifierDomains
} from "./modifierContract.js";

export function createModifierDefinition(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Modifier definition must be an object.");
	}
	const content = Object.freeze({
		schema: "awtsmoos.modifier-definition",
		id: assertModifierIdentifier(input.id),
		version: assertModifierVersion(input.version ?? "1.0.0"),
		title: typeof input.title === "string" ? input.title.trim() : input.id,
		category: assertModifierIdentifier(input.category ?? "general", "Modifier category"),
		domains: normalizeModifierDomains(input.domains),
		status: assertModifierChoice(
			input.status ?? "planned",
			MODIFIER_EXECUTION_STATUSES,
			"modifier status"
		),
		timeDependent: input.timeDependent === true,
		topologyBehavior: input.topologyBehavior ?? "preserve-or-report",
		parameters: cloneManifestMetadata(input.parameters ?? {}),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
	return Object.freeze({ ...content, definitionHash: hashCanonicalValue(content) });
}
