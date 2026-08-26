//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandCatalog.js
 * @description
 * The Awtsmoos gives each public power a distinct vessel, named before any agent asks it to act;
 * Awtsmoos.com keeps command metadata immutable and discoverable so world and performance expansion never tangle the protocol pact.
 */

const MITZVOT_COMMANDS = Object.freeze([
	['project.snapshot', false, true, {}, 'Inspect the current project without mutation.'],
	['project.previewPrompt', false, false, { prompt: 'string' }, 'Generate and validate a project preview before installation.'],
	['project.applyPreview', true, false, {}, 'Apply the current validated preview through the Studio document codec.'],
	['project.discardPreview', false, true, {}, 'Discard generated preview state without replacing the active project.'],
	['performance.capabilities', false, true, {}, 'Discover expression, motion, recipe, channel, and composition capabilities.'],
	['performance.recipe', false, true, { name: 'string' }, 'Resolve one named acting recipe into bounded detached performance data.'],
	['performance.compile', false, true, { prompt: 'string' }, 'Compile nuanced face, gaze, gesture, timing, and natural-motion direction.'],
	['animation.planPasses', false, true, { plan: 'object' }, 'Expand beat timing into inspectable professional animation passes.'],
	['world.capabilities', false, true, {}, 'Discover installed deterministic world generators, schemas, realism presets, and texture modes.'],
	['world.inspect', false, true, { kind: 'string' }, 'Validate one world-asset intent and return exact data-path diagnostics without mutation.'],
	['world.create', true, false, { kind: 'string' }, 'Create one undoable selectable v3 world entity in the canonical Studio project.']
]);

const MITZVAH_EXAMPLES = Object.freeze({
	'project.snapshot': {},
	'project.previewPrompt': { prompt: 'Two friends discover a glowing door.' },
	'project.applyPreview': {},
	'project.discardPreview': {},
	'performance.capabilities': {},
	'performance.recipe': { name: 'subtleListener' },
	'performance.compile': { prompt: 'Subtle concern, look to partner, then nod.' },
	'animation.planPasses': { plan: { fps: 24, beats: [] } },
	'world.capabilities': {},
	'world.inspect': { kind: 'tree', seed: 'cedar-proof', realism: 'natural' },
	'world.create': { kind: 'rock', seed: 'ridge-03', realism: 'cinematic' }
});

/** Canonical immutable source of public Animator command descriptors. */
export class MitzvahAnimatorCommandCatalog {
	/**
	 * Returns detached command descriptors suitable for public capability discovery.
	 * @returns {Array<object>} Independent command metadata objects.
	 */
	static all() {
		return MITZVOT_COMMANDS.map(([name, mutation, idempotent, payload, description]) => {
			return {
				name,
				mutation,
				idempotent,
				payload: { ...payload },
				description,
				example: {
					command: name,
					payload: structuredClone(MITZVAH_EXAMPLES[name])
				}
			};
		});
	}

	/**
	 * Reports whether a command belongs to the current public protocol.
	 * @param {string} shemMitzvah Candidate command name.
	 * @returns {boolean} True when the command is published.
	 */
	static supports(shemMitzvah) {
		return MITZVOT_COMMANDS.some(([name]) => name === shemMitzvah);
	}
}
