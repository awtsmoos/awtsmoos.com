//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MacroStore.js
 * @description Stores reusable command sequences inside canonical project JSON without persisting executable functions.
 * The Awtsmoos gathers many deeds into one remembered vessel while each command keeps its own face;
 * Awtsmoos.com lets history become a reusable path whose steps remain inspectable, editable, and traceable in place.
 */
import { historyToMacroSteps } from '../history/CreativeHistory.js';
import { clonePlain, makeId } from '../../project/ids.js';

/**
 * Owns persistence of declarative macro documents inside `project.creative.macros`.
 */
export class MacroStore {
	/**
	 * @param {object} input Shared state and command registry used to validate stored steps.
	 */
	constructor({ state, registry } = {}) {
		this.state = state;
		this.registry = registry;
	}

	/** Returns detached macro documents for human, script, or AI inspection. */
	list() {
		return clonePlain(this.state.project.creative.macros);
	}

	/** Returns one detached macro document or null. */
	get(macroId) {
		const macro = this.state.project.creative.macros.find((entry) => {
			return entry.id === macroId;
		});
		return macro ? clonePlain(macro) : null;
	}

	/**
	 * Persists one declarative macro after validating each referenced command identity.
	 * @param {object} input Macro identity, name, parameters, and steps.
	 * @returns {object} Detached persisted macro.
	 */
	create(input = {}) {
		const macro = {
			id: input.id || makeId('macro'),
			name: String(input.name || 'Untitled Macro'),
			version: Number(input.version || 1),
			parameters: clonePlain(input.parameters || []),
			steps: this.validateSteps(input.steps || []),
			createdAt: input.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		this.state.project.creative.macros.push(macro);
		this.state.project.updatedAt = Date.now();
		return clonePlain(macro);
	}

	/** Converts a successful operation-history range into a reusable macro document. */
	createFromHistory(name, fromIndex = 0, toIndex) {
		const creative = this.state.project.creative;
		const finalIndex = toIndex ?? creative.operationLog.length - 1;
		const steps = historyToMacroSteps(creative, fromIndex, finalIndex);
		return this.create({ name, steps });
	}

	validateSteps(steps) {
		return steps.map((step) => {
			if (step.commandId) {
				this.registry.require(step.commandId);
				return {
					commandId: step.commandId,
					parameters: clonePlain(step.parameters || {})
				};
			}

			if (step.macroId) {
				return {
					macroId: step.macroId,
					parameters: clonePlain(step.parameters || {})
				};
			}

			throw new TypeError('Macro step requires commandId or macroId.');
		});
	}
}
