// B"H
// Boruch Hashem
// Blessed is He
/** A harvested Blender build becomes one canonical manifest whose omissions remain visible. */

import { cloneManifestMetadata } from "../../foundation/canonical/cloneManifestMetadata.js";
import { hashCanonicalValue } from "../../foundation/canonical/index.js";
import {
	normalizeModifierRecord,
	normalizeTreeRecord,
	sortRecords
} from "./normalizeBlenderManifestRecords.js";

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export function createBlenderSchemaManifest(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Blender schema manifest must be an object.");
	}
	const blenderVersion = String(input.blenderVersion ?? input.version ?? "");
	if (!VERSION_PATTERN.test(blenderVersion)) {
		throw new TypeError("Blender schema manifest requires semantic blenderVersion text.");
	}
	const content = Object.freeze({
		blenderVersion,
		buildHash: String(input.buildHash ?? "unknown"),
		buildBranch: String(input.buildBranch ?? "unknown"),
		buildPlatform: String(input.buildPlatform ?? "unknown"),
		exporterVersion: String(input.exporterVersion ?? "1.0.0"),
		treeTypes: Object.freeze((input.treeTypes ?? []).map(normalizeTreeRecord)
			.sort((left, right) => left.nativeType.localeCompare(right.nativeType))),
		modifiers: Object.freeze((input.modifiers ?? []).map(normalizeModifierRecord)
			.sort((left, right) => left.nativeType.localeCompare(right.nativeType))),
		interfaces: sortRecords(input.interfaces, "id"),
		zones: sortRecords(input.zones, "id"),
		aliases: sortRecords(input.aliases, "from"),
		diagnostics: sortRecords(input.diagnostics, "code"),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
	return Object.freeze({
		schema: "awtsmoos.blender-schema-manifest",
		contentHash: hashCanonicalValue(content),
		...content
	});
}
