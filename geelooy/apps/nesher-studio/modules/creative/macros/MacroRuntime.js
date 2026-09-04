//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MacroRuntime.js
 * @description Replays declarative workflows through one shared command runtime and one atomic project transaction while policy stays in focused vessels.
 * The Awtsmoos gathers many steps into one remembered river without drowning the identity of each stone;
 * Awtsmoos.com lets the macro flow through Yesod, yet success seals once and failure returns every command home.
 */
import {
	assertMacroExecutionDepth,
	createMacroOutcome,
	createMacroTransactionId,
	macroResultsChanged
} from './MacroExecutionPolicy.js';
import { resolveMacroTemplates } from './MacroTemplateResolver.js';
import { createMacroTransactionScope } from './MacroTransactionScope.js';

/** Coordinates nested macro execution through the shared command runtime. */
export class MacroRuntime {
	/** @param {object} input Shared state, macro store, and command runtime. */
	constructor({ state, store, runtime } = {}) {
		this.state = state;
		this.store = store;
		this.runtime = runtime;
	}

	/**
	 * Executes one macro with cycle protection and one borrowed-or-owned atomic transaction.
	 * @param {string} macroId Canonical macro identity.
	 * @param {object} bindings Values exposed to `{{name}}` placeholders.
	 * @param {object} options Provenance and shared transaction metadata.
	 * @param {Array<string>} ancestry Internal recursion path.
	 * @returns {Promise<object>} Macro execution evidence.
	 */
	async execute(macroId, bindings = {}, options = {}, ancestry = []) {
		assertMacroExecutionDepth(macroId, ancestry);
		const macro = this.store.get(macroId);

		if (!macro) {
			throw new Error(`Unknown macro: ${macroId}.`);
		}

		const scope = createMacroTransactionScope(
			this.state,
			this.runtime,
			macro,
			options
		);
		const transactionId = options.transactionId || createMacroTransactionId();
		const lineage = [...ancestry, macroId];

		try {
			const results = await this.executeSteps(
				macro,
				bindings,
				{
					...options,
					transaction: scope.transaction,
					transactionId,
					parentMacroId: macroId,
					deferRefresh: true
				},
				lineage
			);
			const changed = macroResultsChanged(results);
			if (changed) {
				scope.commit();
			} else {
				scope.rollback();
			}
			return createMacroOutcome(
				macroId,
				transactionId,
				results,
				changed
			);
		} catch (error) {
			scope.rollback();
			throw error;
		}
	}

	/** Runs every macro step sequentially inside the shared transaction. */
	async executeSteps(macro, bindings, options, lineage) {
		const results = [];
		for (const step of macro.steps) {
			results.push(
				await this.executeStep(step, bindings, options, lineage)
			);
		}
		return results;
	}

	/** Executes either a nested macro or ordinary command through the same borrowed transaction. */
	async executeStep(step, bindings, options, lineage) {
		const parameters = resolveMacroTemplates(
			step.parameters || {},
			bindings
		);
		if (step.macroId) {
			return this.execute(step.macroId, bindings, options, lineage);
		}
		return this.runtime.execute(step.commandId, parameters, {
			...options,
			source: 'macro'
		});
	}
}
