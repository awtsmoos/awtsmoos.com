//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioCreativeApi.js
 * @description Exposes JavaScript and JSON as safe views of the same command runtime while focused helpers own envelope validation and parameter shaping.
 * The Awtsmoos speaks one creative language through many doors without granting a hidden throne;
 * Awtsmoos.com lets scripts inspect detached truth and invoke only commands the maker can also own.
 */
import { REUSE_COMMAND_IDS } from '../catalog/ReuseCommandIds.js';
import {
	recentCreativeHistory,
	recentCreativeOperations
} from '../history/CreativeHistory.js';
import { clonePlain } from '../../project/ids.js';
import {
	executeCreativeJsonOperation,
	macroCreationParameters
} from './CreativeApiOperations.js';

/** Creates the stable public Studio API without exposing mutable project references. */
export function createStudioCreativeApi(services = {}) {
	const {
		state,
		registry,
		runtime,
		macroStore,
		macroRuntime,
		presetStore
	} = services;

	return Object.freeze({
		commands() {
			return registry.list(state);
		},
		searchCommands(query = '') {
			return registry.search(query, state);
		},
		execute(commandId, parameters = {}, options = {}) {
			return runtime.execute(commandId, parameters, {
				...options,
				source: options.source || 'script'
			});
		},
		executeJson(operation) {
			return executeCreativeJsonOperation(runtime, operation);
		},
		project() {
			return clonePlain(state.project);
		},
		history(count = 20) {
			return recentCreativeHistory(state.project.creative, count);
		},
		operations(count = 20) {
			return recentCreativeOperations(state.project.creative, count);
		},
		listMacros() {
			return macroStore.list();
		},
		createMacroFromHistory(name, fromIndex = 0, toIndex, options = {}) {
			return runtime.execute(
				REUSE_COMMAND_IDS.CREATE_MACRO_FROM_HISTORY,
				macroCreationParameters(name, fromIndex, toIndex),
				withScriptSource(options)
			);
		},
		runMacro(macroId, parameters = {}, options = {}) {
			return macroRuntime.execute(macroId, parameters, options);
		},
		listPresets() {
			return presetStore.list();
		},
		createPreset(input, options = {}) {
			return runtime.execute(
				REUSE_COMMAND_IDS.CREATE_PRESET,
				input,
				withScriptSource(options)
			);
		},
		applyPreset(presetId, options = {}) {
			return presetStore.apply(presetId, options);
		}
	});
}

/** Preserves caller metadata while defaulting public JavaScript execution provenance to script. */
function withScriptSource(options = {}) {
	return {
		...options,
		source: options.source || 'script'
	};
}
