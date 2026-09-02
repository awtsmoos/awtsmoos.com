//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file reuseCommands.js
 * @description Makes reusable creative assets themselves ordinary canonical commands instead of privileged side paths.
 * The Awtsmoos lets remembered work become a macro or preset through the same gate as every other deed;
 * Awtsmoos.com records reuse as editable history so human, AI, JSON, and script share one creative seed.
 */
const REUSE_SURFACES = ['human', 'command', 'script', 'json', 'ai'];

/** Returns the commands that turn existing work and parameters into reusable project assets. */
export function reuseCommandDefinitions() {
	return [createMacroFromHistoryDefinition(), createPresetDefinition()];
}

function createMacroFromHistoryDefinition() {
	return {
		id: 'creative.macro.createFromHistory',
		version: 1,
		label: 'Create macro from history',
		description: 'Turn a range of successful creative operations into an editable reusable macro.',
		domain: 'creative',
		level: 'parameterized',
		tags: ['macro', 'history', 'reuse', 'workflow'],
		parameters: {
			name: { type: 'string', required: true },
			fromIndex: { type: 'number', default: 0, min: 0 },
			toIndex: { type: 'number', min: 0 }
		},
		surfaces: REUSE_SURFACES,
		projectionHints: { nodeCandidate: true },
		executor({ parameters, services }) {
			return services.macroStore.createFromHistory(
				parameters.name,
				parameters.fromIndex,
				parameters.toIndex
			);
		},
		summarizeResult: summarizeMacro
	};
}

function createPresetDefinition() {
	return {
		id: 'creative.preset.create',
		version: 1,
		label: 'Create command preset',
		description: 'Save a named parameter configuration for any registered command.',
		domain: 'creative',
		level: 'parameterized',
		tags: ['preset', 'parameters', 'reuse'],
		parameters: {
			name: { type: 'string', required: true },
			commandId: { type: 'string', required: true },
			parameters: { type: 'object', default: {} }
		},
		surfaces: REUSE_SURFACES,
		projectionHints: { nodeCandidate: false },
		executor({ parameters, services }) {
			return services.presetStore.create(parameters);
		},
		summarizeResult: summarizePreset
	};
}

function summarizeMacro(macro) {
	return {
		id: macro.id,
		name: macro.name,
		version: macro.version,
		stepCount: macro.steps.length
	};
}

function summarizePreset(preset) {
	return {
		id: preset.id,
		name: preset.name,
		version: preset.version,
		commandId: preset.commandId
	};
}
