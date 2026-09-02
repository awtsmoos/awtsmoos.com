//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installCreativeRuntime.js
 * @description Installs one transient creative-language runtime over the canonical project and exposes one public facade.
 * The Awtsmoos gives every operator one gate while functions remain outside the saved scroll;
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

/** Installs all currently implemented creative-language services exactly once for a state object. */
export function installCreativeRuntime(state, options = {}) {
	if (state.creativeRuntime) {
		return state.creativeRuntime;
	}

	ensureCreativeProjectState(state.project);
	const registry = registerCoreCommands(new CommandRegistry());
	const macroStore = new MacroStore({ state, registry });
	const presetStore = new PresetStore({ state, registry });
	const services = { macroStore, presetStore };
	const runtime = new CommandRuntime({
		state,
		registry,
		services,
		refresh: options.refresh
	});
	presetStore.attachRuntime(runtime);
	const macroRuntime = new MacroRuntime({ store: macroStore, runtime });
	const api = createStudioCreativeApi({
		state,
		registry,
		runtime,
		macroStore,
		macroRuntime,
		presetStore
	});
	const ai = createAiCreativeBridge(api);
	const publicApi = Object.freeze({ ...api, ai });
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

function publishCreativeRuntime(publicApi, exposeGlobal) {
	if (exposeGlobal && typeof globalThis.window !== 'undefined') {
		globalThis.window.AwtsmoosStudio = publicApi;
	}

	if (typeof globalThis.dispatchEvent === 'function' && typeof globalThis.CustomEvent === 'function') {
		globalThis.dispatchEvent(new globalThis.CustomEvent('awtsmoos-studio:creative-ready', {
			detail: { api: publicApi }
		}));
	}
}
