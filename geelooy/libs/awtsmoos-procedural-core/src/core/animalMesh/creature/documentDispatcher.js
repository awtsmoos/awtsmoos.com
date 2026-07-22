// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { createAtzilusGenome, compileGenomeToBriah } from "./documents.js";
import { replayCreatureHistory, redoCreatureRecord, undoCreatureRecord } from "./historyService.js";
import { validateBriahCreature } from "./validation.js";
import { CreatureOperationError } from "./contracts.js";

function compareDocuments(first, second) {
	return {
		equal: first.contentHash === second.contentHash,
		contentHashes: [first.contentHash, second.contentHash],
		revisionDelta: second.revision - first.revision,
		counts: {
			sections: [first.body.sections.length, second.body.sections.length],
			parts: [first.parts.length, second.parts.length],
			limbs: [first.limbs.length, second.limbs.length],
			symmetryGroups: [first.symmetryGroups.length, second.symmetryGroups.length]
		}
	};
}

/**
 * Handles authoritative document, branch, comparison, history, and registry reads.
 * The Briah document remains the editable truth while every clone or branch keeps
 * provenance explicit and every replay proves whether semantic history converges.
 * @param {Object} kernel - CreatureKernel instance.
 * @param {Object} request - Registered document operation request.
 * @returns {Object} Document operation result.
 */
export function dispatchDocumentOperation(kernel, request) {
	const operation = request.operation;
	if (operation === "creature.create") {
		const genome = createAtzilusGenome(request.arguments || {});
		const document = compileGenomeToBriah(genome);
		const record = kernel.store.createRecord(document, genome);
		return { artifactId: record.artifactId, atzilusGenome: cloneCreatureValue(genome), briahCreature: cloneCreatureValue(document) };
	}
	if (operation === "creature.operation.list") {
		return { operations: [...kernel.catalog.values()] };
	}
	if (operation === "creature.operation.inspect") {
		const definition = kernel.catalog.get(request.arguments?.operation);
		if (!definition) {
			throw new CreatureOperationError("CREATURE_OPERATION_UNKNOWN", `Unknown operation: ${request.arguments?.operation}`);
		}
		return definition;
	}
	const record = kernel.store.requireRecord(request.target?.artifactId);
	if (operation === "creature.inspect") {
		return { artifactId: record.artifactId, briahCreature: cloneCreatureValue(record.document), historyLength: record.history.length, branchOf: record.branchOf };
	}
	if (operation === "creature.validate") {
		return validateBriahCreature(record.document);
	}
	if (operation === "creature.compare") {
		const other = kernel.store.requireRecord(request.arguments?.otherArtifactId);
		return compareDocuments(record.document, other.document);
	}
	if (operation === "creature.clone" || operation === "creature.branch") {
		const cloned = kernel.store.createRecord(record.document, record.genome, { branchOf: operation === "creature.branch" ? record.artifactId : null });
		cloned.origin = cloneCreatureValue(record.document);
		return { artifactId: cloned.artifactId, branchOf: cloned.branchOf, briahCreature: cloneCreatureValue(cloned.document) };
	}
	if (operation === "creature.replay") {
		return replayCreatureHistory(record);
	}
	if (operation === "creature.undo") {
		return { artifactId: record.artifactId, ...undoCreatureRecord(record) };
	}
	if (operation === "creature.redo") {
		return { artifactId: record.artifactId, ...redoCreatureRecord(record) };
	}
	throw new CreatureOperationError("CREATURE_DOCUMENT_OPERATION_UNKNOWN", `Unsupported document operation: ${operation}`);
}
