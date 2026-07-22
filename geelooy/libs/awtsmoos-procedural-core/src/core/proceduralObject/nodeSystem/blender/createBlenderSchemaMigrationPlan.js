// B"H
// Boruch Hashem
// Blessed is He
/** Version migration is an immutable plan of additions, removals, aliases, and changed RNA. */

import { hashCanonicalValue } from "../../foundation/canonical/index.js";
import { createBlenderSchemaManifest } from "./createBlenderSchemaManifest.js";
import {
	diffRecordSet,
	flattenManifestNodes,
	flattenNodeProperties,
	flattenNodeSockets
} from "./diffBlenderSchemaRecords.js";

function collectOperations(from, to) {
	const fromNodes = flattenManifestNodes(from);
	const toNodes = flattenManifestNodes(to);
	return [
		...diffRecordSet(fromNodes, toNodes, { key: "migrationId", kind: "node" }),
		...diffRecordSet(
			flattenNodeSockets(fromNodes),
			flattenNodeSockets(toNodes),
			{ key: "migrationId", kind: "socket" }
		),
		...diffRecordSet(
			flattenNodeProperties(fromNodes),
			flattenNodeProperties(toNodes),
			{ key: "migrationId", kind: "node-property" }
		),
		...diffRecordSet(from.modifiers, to.modifiers, { key: "nativeType", kind: "modifier" }),
		...diffRecordSet(from.interfaces, to.interfaces, { key: "id", kind: "interface" }),
		...diffRecordSet(from.zones, to.zones, { key: "id", kind: "zone" }),
		...to.aliases.map(alias => ({ op: "alias", ...alias }))
	].sort((left, right) => `${left.op}:${left.id ?? left.from}`
		.localeCompare(`${right.op}:${right.id ?? right.from}`));
}

export function createBlenderSchemaMigrationPlan(fromInput, toInput) {
	const from = createBlenderSchemaManifest(fromInput.manifest ?? fromInput);
	const to = createBlenderSchemaManifest(toInput.manifest ?? toInput);
	const operations = Object.freeze(collectOperations(from, to).map(Object.freeze));
	const content = Object.freeze({
		fromVersion: from.blenderVersion,
		toVersion: to.blenderVersion,
		fromHash: from.contentHash,
		toHash: to.contentHash,
		operations
	});
	return Object.freeze({
		schema: "awtsmoos.blender-schema-migration-plan",
		contentHash: hashCanonicalValue(content),
		...content,
		hasChanges: operations.length > 0
	});
}
