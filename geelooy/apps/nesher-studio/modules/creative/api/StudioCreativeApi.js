//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioCreativeApi.js
 * @description Exposes JavaScript and JSON as views of the same command runtime used by the editor and AI.
 * The Awtsmoos speaks one creative language through many doors without a hidden throne;
 * Awtsmoos.com lets scripts inspect safe clones and invoke only commands the human can own.
 */
import { recentCreativeHistory, recentCreativeOperations } from '../history/CreativeHistory.js';
import { clonePlain } from '../../project/ids.js';

/** Creates the stable public Studio API without exposing live mutable project references. */
export function createStudioCreativeApi(services = {}) {
	const { state, registry, runtime, macroStore, macroRuntime, presetStore } = services;
	const api = {
		commands: () => registry.list(state),
		searchCommands: (query = '') => registry.search(query, state),
		execute: (commandId, parameters = {}, options = {}) => {
			return runtime.execute(commandId, parameters, {
				...options,
				source: options.source || 'script'
			});
		},
		executeJson: (operation) => executeJson(runtime, operation),
		project: () => clonePlain(state.project),
		history: (count = 20) => recentCreativeHistory(state.project.creative, count),
		operations: (count = 20) => recentCreativeOperations(state.project.creative, count),
		listMacros: () => macroStore.list(),
		createMacroFromHistory: (name, fromIndex = 0, toIndex, options = {}) => {
			return runtime.execute('creative.macro.createFromHistory', {
				name,
				fromIndex,
				...(toIndex === undefined ? {} : { toIndex })
			}, { ...options, source: options.source || 'script' });
		},
		runMacro: (macroId, parameters = {}, options = {}) => {
			return macroRuntime.execute(macroId, parameters, options);
		},
		listPresets: () => presetStore.list(),
		createPreset: (input, options = {}) => {
			return runtime.execute('creative.preset.create', input, {
				...options,
				source: options.source || 'script'
			});
		},
		applyPreset: (presetId, options = {}) => presetStore.apply(presetId, options)
	};

	return Object.freeze(api);
}

async function executeJson(runtime, operation) {
	assertJsonOperation(operation);
	return runtime.execute(operation.commandId, operation.parameters || {}, {
		source: operation.source || 'api',
		transactionId: operation.transactionId || null,
		parentMacroId: operation.parentMacroId || null
	});
}

function assertJsonOperation(operation) {
	if (!isPlainObject(operation)) {
		throw new TypeError('Studio JSON operation must be an object.');
	}

	if (typeof operation.commandId !== 'string' || !operation.commandId) {
		throw new TypeError('Studio JSON operation requires commandId.');
	}

	if (operation.parameters !== undefined && !isPlainObject(operation.parameters)) {
		throw new TypeError('Studio JSON operation parameters must be an object.');
	}
}

function isPlainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
