//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommandRuntime.js
 * @description Executes every creative command through one validated transactional path regardless of caller.
 * The Awtsmoos is one beneath human hand, AI voice, macro step, preset, and script call;
 * Awtsmoos.com lets one runtime judge, mutate, record, undo, and refresh them all.
 */
import { appendCreativeOperation } from '../history/CreativeHistory.js';
import { beginProjectTransaction } from '../history/ProjectTransaction.js';
import { createOperationEnvelope } from '../operations/OperationEnvelope.js';
import { syncProjectFromState } from '../../state.js';

export class CommandRuntime {
	constructor({ state, registry, services = {}, refresh = null } = {}) {
		this.state = state;
		this.registry = registry;
		this.services = services;
		this.refresh = typeof refresh === 'function' ? refresh : null;
	}

	/** Executes a stable command identity through the shared creative transaction law. */
	async execute(commandId, parameters = {}, options = {}) {
		const definition = this.registry.require(commandId);
		const normalized = definition.validate(parameters);
		const availability = definition.availability(this.state, normalized);

		if (!availability.available) {
			throw new Error(`${commandId}: ${availability.reason || 'command unavailable'}`);
		}

		const transaction = definition.mutation === 'canonical'
			? beginProjectTransaction(this.state, definition.label)
			: null;

		try {
			const result = await definition.executor(this.executionContext(normalized, options));

			if (isNoOp(result)) {
				transaction?.rollback();
				return { ok: true, noOp: true, commandId };
			}

			return this.finishSuccess(definition, normalized, result, options, transaction);
		} catch (error) {
			transaction?.rollback();
			throw error;
		}
	}

	executionContext(parameters, options) {
		return {
			state: this.state,
			project: this.state.project,
			parameters,
			options,
			services: this.services
		};
	}

	finishSuccess(definition, parameters, result, options, transaction) {
		syncProjectFromState(this.state);
		const summary = definition.summarizeResult(result);
		const operation = createOperationEnvelope({
			definition,
			parameters,
			result: summary,
			source: options.source,
			transactionId: options.transactionId,
			parentMacroId: options.parentMacroId
		});

		if (definition.mutation === 'canonical') {
			appendCreativeOperation(this.state.project.creative, operation);
			transaction.commit();
		}

		this.refresh?.();
		return { ok: true, noOp: false, commandId: definition.id, operation, result: summary };
	}
}

function isNoOp(result) {
	return result === null || result === false;
}
