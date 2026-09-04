//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommandRuntime.js
 * @description Executes every creative command through one validated path whose transaction may be owned locally or borrowed from an outer macro.
 * The Awtsmoos is one beneath human hand, AI voice, macro step, preset, and script call;
 * Awtsmoos.com lets Tiferes join validation and execution while focused vessels own transaction and history's fall.
 */
import { createCommandTransactionScope } from './CommandTransactionScope.js';
import { recordCommandSuccess } from './CommandSuccessRecorder.js';

/** Coordinates shared creative command execution. */
export class CommandRuntime {
	/** @param {object} input Shared state, registry, transient services, and refresh callback. */
	constructor({ state, registry, services = {}, refresh = null } = {}) {
		this.state = state;
		this.registry = registry;
		this.services = services;
		this.refresh = typeof refresh === 'function' ? refresh : null;
	}

	/**
	 * Executes one stable command through validation, availability, transaction, history, and refresh.
	 * @param {string} commandId Registered stable command identity.
	 * @param {object} parameters Declarative command input.
	 * @param {object} options Provenance, grouping, and optional borrowed transaction metadata.
	 * @returns {Promise<object>} Serializable execution evidence.
	 */
	async execute(commandId, parameters = {}, options = {}) {
		const definition = this.registry.require(commandId);
		const normalized = definition.validate(parameters);
		const availability = definition.availability(
			this.state,
			normalized
		);

		if (!availability.available) {
			throw new Error(
				`${commandId}: ${availability.reason || 'command unavailable'}`
			);
		}

		const scope = createCommandTransactionScope(
			this.state,
			definition,
			options
		);

		try {
			const result = await definition.executor(
				this.executionContext(normalized, options)
			);

			if (isNoOp(result)) {
				scope.rollback();
				return noOpOutcome(commandId);
			}

			const outcome = recordCommandSuccess({
				state: this.state,
				definition,
				parameters: normalized,
				result,
				options,
				scope
			});
			this.refreshIfNeeded(options);
			return outcome;
		} catch (error) {
			scope.rollback();
			throw error;
		}
	}

	/** Returns explicit transient dependencies made available to command executors. */
	executionContext(parameters, options) {
		return {
			state: this.state,
			project: this.state.project,
			parameters,
			options,
			services: this.services
		};
	}

	/** Refreshes human projections unless an outer atomic workflow owns final presentation. */
	refreshIfNeeded(options) {
		if (!options.deferRefresh) {
			this.refresh?.();
		}
	}
}

/** Returns one consistent no-op execution result. */
function noOpOutcome(commandId) {
	return {
		ok: true,
		noOp: true,
		commandId
	};
}

/** Treats explicit null/false command results as intentional no-op evidence. */
function isNoOp(result) {
	return result === null || result === false;
}
