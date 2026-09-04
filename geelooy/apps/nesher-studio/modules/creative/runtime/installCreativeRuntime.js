//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installCreativeRuntime.js
 * @description Installs one transient Universal Creative Language runtime over canonical project truth, including atomic reusable workflows.
 * The Awtsmoos gives many operators one gate while runtime functions stay outside the saved scroll;
 * Awtsmoos.com lets UI, AI, JSON, macro, preset, and script meet the same command soul.
 */
import { createAiCreativeBridge } from '../api/AiCreativeBridge.js';
import { createStudioCreativeApi } from '../api/StudioCreativeApi.js';
import { registerCoreCommands } from '../catalog/registerCoreCommands.js';
import { CommandRegistry } from '../commands/CommandRegistry.js';
import { MacroRuntime } from '../macros/MacroRuntime.js';
import { MacroStore } from '../macros/MacroStore.js';
import { PresetStore } from '../presets/PresetStore.js';
import { ensureCreativeProjectState } from '../state/CreativeProjectState.js';
import { CommandRuntime } from './CommandRuntime.js';

/**
 * Installs all currently implemented creative-language services exactly once per editor state.
 * @param {object} state Shared Studio runtime state.
 * @param {object} options Refresh callback and optional global exposure flag.
 * @returns {object} Installed transient service vessel.
 */
export function installCreativeRuntime(state, options = {}) {
	if (state.creativeRuntime) {
		return state.creativeRuntime;
	}

	ensureCreativeProjectState(state.project);
	const registry = registerCoreCommands(new CommandRegistry());
	const macroStore = new MacroStore({
		state,
		registry
	});
	const presetStore = new PresetStore({
		state,
		registry
	});
	const runtime = new CommandRuntime({
		state,
		registry,
		services: {
			macroStore,
			presetStore
		},
		refresh: options.refresh
	});

	presetStore.attachRuntime(runtime);
	const macroRuntime = new MacroRuntime({
		state,
		store: macroStore,
		runtime
	});
	const baseApi = createStudioCreativeApi({
		state,
		registry,
		runtime,
		macroStore,
		macroRuntime,
		presetStore
	});
	const ai = createAiCreativeBridge(baseApi);
	const publicApi = Object.freeze({
		...baseApi,
		ai
	});
	const installed = {
		registry,
		runtime,
		macroStore,
		macroRuntime,
		presetStore,
		api: publicApi,
		ai
	};

	state.creativeRuntime = installed;
	publishCreativeRuntime(publicApi, options.exposeGlobal !== false);
	return installed;
}

/** Publishes the safe public API and readiness event without exposing the mutable runtime vessel. */
function publishCreativeRuntime(publicApi, exposeGlobal) {
	if (exposeGlobal && typeof globalThis.window !== 'undefined') {
		globalThis.window.AwtsmoosStudio = publicApi;
	}

	if (
		typeof globalThis.dispatchEvent === 'function'
		&& typeof globalThis.CustomEvent === 'function'
	) {
		globalThis.dispatchEvent(
			new globalThis.CustomEvent('awtsmoos-studio:creative-ready', {
				detail: {
					api: publicApi
				}
			})
		);
	}
}
