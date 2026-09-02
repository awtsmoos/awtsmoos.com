//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MacroStore.js
 * @description Stores reusable command sequences inside canonical project JSON without storing executable functions.
 * The Awtsmoos gathers many steps into one named vessel while each step keeps its own face;
 * Awtsmoos.com turns remembered work into inspectable macros that remain editable in place.
 */
import { historyToMacroSteps } from '../history/CreativeHistory.js';
import { clonePlain, makeId } from '../../project/ids.js';

export class MacroStore {
	constructor({ state, registry } = {}) {
		this.state = state;
		this.registry = registry;
	}

	/** Lists detached macro documents safe for UI, script, or AI inspection. */
	list() {
		return clonePlain(this.state.project.creative.macros);
	}

	/** Returns one detached macro document or null. */
	get(macroId) {
		const macro = this.state.project.creative.macros.find((entry) => entry.id === macroId);
		return macro ? clonePlain(macro) : null;
	}

	/** Persists one validated declarative macro inside the canonical project. */
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

	/** Converts a canonical operation range into a reusable macro document. */
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
				return { macroId: step.macroId, parameters: clonePlain(step.parameters || {}) };
			}

			throw new TypeError('Macro step requires commandId or macroId.');
		});
	}
}
