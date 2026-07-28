// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { UNIVERSAL_API_ID } from "./constants.js";
import { cloneJson, stableId } from "./data.js";
import { normalizeError } from "./errors.js";
import { assertSchema } from "./schema.js";
import { executeBatch } from "./executeBatch.js";
import { createResultEnvelope } from "./resultEnvelope.js";
import { assertCommand } from "./commandValidation.js";

/** One execution path for JSON commands, runtime methods, forms, and batches. */
export class CommandExecutor {
	constructor(input) {
		this.apiId = UNIVERSAL_API_ID;
		this.registry = input.registry;
		this.document = input.document;
		this.history = input.history;
		this.events = input.events;
		this.runtimeAdapter = input.runtimeAdapter ?? null;
		this.importResolver = input.importResolver ?? null;
	}

	async execute(command, executionOptions = {}) {
		try {
			assertCommand(command, this.document.revision);
			if (command.method === "core.batch") {
				return await executeBatch(this, command, executionOptions);
			}
			return await this.executeOne(command, executionOptions);
		} catch (error) {
			return {
				api: UNIVERSAL_API_ID,
				id: command?.id ?? null,
				ok: false,
				error: normalizeError(error)
			};
		}
	}

	async executeOne(command, executionOptions = {}) {
		const definition = this.registry.get(command.method);
		const validation = assertSchema(command.params ?? {}, definition.paramsSchema);
		const beforeDocument = cloneJson(executionOptions.document ?? this.document);
		const draft = cloneJson(beforeDocument);
		const changes = {
			created: [],
			updated: [],
			deleted: [],
			warnings: [],
			mutated: definition.mutates
		};
		const context = {
			document: draft,
			created: changes.created,
			updated: changes.updated,
			deleted: changes.deleted,
			warnings: changes.warnings,
			registry: this.registry,
			executor: this
		};
		const result = await definition.execute(context, cloneJson(command.params ?? {}));
		const before = beforeDocument.revision;
		const after = definition.mutates ? before + 1 : before;
		draft.revision = after;
		const dryRun = command.options?.dryRun || executionOptions.dryRun;
		const transactionId = stableId("transaction", command.id, before, after);
		if (!dryRun && !executionOptions.detached) {
			await this.commitRuntime(command, beforeDocument, draft, changes);
			this.document = draft;
			if (definition.mutates) {
				this.history.push({ id: transactionId, before: beforeDocument, after: draft });
				this.events.emit({
					event: "transaction.committed",
					resource: "world",
					transactionId,
					changes
				});
			}
		}
		const envelope = createResultEnvelope({
			command,
			transactionId,
			before,
			after,
			changes,
			result,
			validation
		});
		if (executionOptions.returnDocument) envelope.document = draft;
		if (!dryRun) return envelope;
		return {
			...envelope,
			dryRun: true,
			wouldCreate: changes.created,
			wouldUpdate: changes.updated,
			wouldDelete: changes.deleted,
			document: executionOptions.returnDocument ? draft : undefined
		};
	}

	async commitRuntime(command, before, after, changes) {
		if (!this.runtimeAdapter) return;
		const stage = await this.runtimeAdapter.prepare({ command, before, after, changes });
		try {
			await this.runtimeAdapter.apply(stage);
			await this.runtimeAdapter.commit(stage);
		} catch (error) {
			await this.runtimeAdapter.rollback(stage, error);
			throw error;
		}
	}

}
