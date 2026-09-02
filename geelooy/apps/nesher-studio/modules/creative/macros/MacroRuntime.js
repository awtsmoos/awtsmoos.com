//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MacroRuntime.js
 * @description Replays reusable workflows through the same command runtime with shared transaction identity.
 * The Awtsmoos gathers many acts without dissolving the face of each deed;
 * Awtsmoos.com lets one macro remain inspectable while every child command keeps the same seed.
 */
const MAX_MACRO_DEPTH = 8;

export class MacroRuntime {
	constructor({ store, runtime } = {}) {
		this.store = store;
		this.runtime = runtime;
	}

	/** Executes one macro or nested macro while guarding cycles and runaway depth. */
	async execute(macroId, bindings = {}, options = {}, ancestry = []) {
		if (ancestry.includes(macroId) || ancestry.length >= MAX_MACRO_DEPTH) {
			throw new Error(`Macro recursion blocked at ${macroId}.`);
		}

		const macro = this.store.get(macroId);
		if (!macro) {
			throw new Error(`Unknown macro: ${macroId}.`);
		}

		const transactionId = options.transactionId || createTransactionId();
		const lineage = [...ancestry, macroId];
		const results = [];

		for (const step of macro.steps) {
			results.push(await this.executeStep(step, bindings, {
				...options,
				transactionId,
				parentMacroId: macroId
			}, lineage));
		}

		return { ok: true, macroId, transactionId, results };
	}

	async executeStep(step, bindings, options, lineage) {
		const parameters = resolveTemplates(step.parameters || {}, bindings);

		if (step.macroId) {
			return this.execute(step.macroId, bindings, options, lineage);
		}

		return this.runtime.execute(step.commandId, parameters, {
			...options,
			source: 'macro'
		});
	}
}

function resolveTemplates(value, bindings) {
	if (Array.isArray(value)) {
		return value.map((entry) => resolveTemplates(entry, bindings));
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, entry]) => [key, resolveTemplates(entry, bindings)])
		);
	}

	if (typeof value === 'string') {
		const match = value.match(/^\{\{([^}]+)\}\}$/);
		return match && Object.prototype.hasOwnProperty.call(bindings, match[1]) ? bindings[match[1]] : value;
	}

	return value;
}

function createTransactionId() {
	return `macro-transaction-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
}
