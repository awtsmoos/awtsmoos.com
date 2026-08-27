// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { UNIVERSAL_API_ID, ERROR_CODES } from "./constants.js";
import { cloneJson, stableId } from "./data.js";
import { UniversalApiError } from "./errors.js";
import { resolveBatchReferences } from "./references.js";

/** Executes operations against one detached draft and commits once or not at all. */
export async function executeBatch(executor, command, executionOptions) {
	const expected = command.options?.expectedRevision;
	if (expected !== undefined && expected !== executor.document.revision) {
		throw new UniversalApiError(ERROR_CODES.REVISION_CONFLICT, "Expected revision does not match.", {
			expectedRevision: expected,
			currentRevision: executor.document.revision
		});
	}
	const base = cloneJson(executor.document);
	let working = cloneJson(base);
	const named = {};
	const summaries = [];
	for (let index = 0; index < (command.params?.operations ?? []).length; index += 1) {
		const operation = command.params.operations[index];
		const params = resolveBatchReferences(operation.params ?? {}, named);
		let child;
		try {
			child = await executor.executeOne(
				{
					...operation,
					api: UNIVERSAL_API_ID,
					id: operation.id ?? `operation-${index}`,
					params,
					options: { ...operation.options, dryRun: true }
				},
				{ document: working, dryRun: true, detached: true, returnDocument: true }
			);
		} catch (error) {
			throw new UniversalApiError(ERROR_CODES.BATCH_FAILED, `Atomic batch failed at operation ${index}.`, {
				failedOperationIndex: index,
				cause: error.message,
				rolledBack: summaries.map((summary) => summary.id)
			});
		}
		working = child.document;
		named[operation.id ?? String(index)] = child;
		summaries.push(child);
	}
	working.revision = base.revision + 1;
	const dryRun = command.options?.dryRun || executionOptions.dryRun;
	const transactionId = stableId("transaction", command.id, base.revision, working.revision);
	if (!dryRun) {
		await executor.commitRuntime(command, base, working, { batch: summaries });
		executor.document = working;
		executor.history.push({ id: transactionId, before: base, after: working });
		executor.events.emit({ event: "transaction.committed", resource: "world", transactionId });
	}
	return {
		api: UNIVERSAL_API_ID,
		id: command.id,
		ok: true,
		dryRun: Boolean(dryRun),
		revisionBefore: base.revision,
		revisionAfter: working.revision,
		results: summaries,
		transactionId,
		document: dryRun ? undefined : working
	};
}
