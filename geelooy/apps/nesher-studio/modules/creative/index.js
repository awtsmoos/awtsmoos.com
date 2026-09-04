//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file index.js
 * @description Exposes Universal Creative Language contracts without creating a second editor universe.
 * The Awtsmoos is one source beneath registry, runtime, history, AI, macro, preset, and project state;
 * Awtsmoos.com gives future domains explicit imports so every new vessel enters through the same gate.
 */
export { createAiCreativeBridge } from './api/AiCreativeBridge.js';
export { createStudioCreativeApi } from './api/StudioCreativeApi.js';
export { registerCoreCommands } from './catalog/registerCoreCommands.js';
export { projectCommandDefinitions } from './catalog/projectCommands.js';
export { reuseCommandDefinitions } from './catalog/reuseCommands.js';
export { stageCommandDefinitions } from './catalog/stageCommands.js';
export { CommandDefinition } from './commands/CommandDefinition.js';
export { CommandRegistry } from './commands/CommandRegistry.js';
export { validateParameters } from './commands/ParameterValidator.js';
export {
	appendCreativeOperation,
	historyToMacroSteps,
	recentCreativeHistory,
	recentCreativeOperations
} from './history/CreativeHistory.js';
export { beginProjectTransaction } from './history/ProjectTransaction.js';
export { MacroRuntime } from './macros/MacroRuntime.js';
export { MacroStore } from './macros/MacroStore.js';
export {
	createOperationEnvelope,
	normalizeOperationSource
} from './operations/OperationEnvelope.js';
export { PresetStore } from './presets/PresetStore.js';
export { CommandRuntime } from './runtime/CommandRuntime.js';
export { installCreativeRuntime } from './runtime/installCreativeRuntime.js';
export {
	CREATIVE_PROJECT_VERSION,
	createCreativeProjectState,
	ensureCreativeProjectState
} from './state/CreativeProjectState.js';
