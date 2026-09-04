//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PresetStore.js
 * @description Stores named parameter vessels while application always returns through the canonical command runtime.
 * The Awtsmoos lets deep configuration wear one simple remembered name without becoming a hidden alternate flame;
 * Awtsmoos.com keeps each preset editable because applying it still invokes the same command that human and AI claim.
 */
import { clonePlain, makeId } from '../../project/ids.js';

/** Persists declarative command presets inside canonical project creative state. */
export class PresetStore {
	/**
	 * @param {object} input Shared state, registry, and optionally attached runtime.
	 */
	constructor({ state, registry, runtime = null } = {}) {
		this.state = state;
		this.registry = registry;
		this.runtime = runtime;
	}

	/** Attaches the shared command runtime after installation resolves its dependency circle. */
	attachRuntime(runtime) {
		this.runtime = runtime;
		return this;
	}

	/** Returns detached preset documents. */
	list() {
		return clonePlain(this.state.project.creative.presets);
	}

	/** Returns one detached preset or null. */
	get(presetId) {
		const preset = this.state.project.creative.presets.find((entry) => {
			return entry.id === presetId;
		});
		return preset ? clonePlain(preset) : null;
	}

	/**
	 * Persists one preset after confirming its target command exists.
	 * @param {object} input Preset name, target command, and parameter bundle.
	 * @returns {object} Detached persisted preset.
	 */
	create(input = {}) {
		if (!input.commandId) {
			throw new TypeError('Preset requires commandId.');
		}

		this.registry.require(input.commandId);
		const preset = {
			id: input.id || makeId('preset'),
			name: String(input.name || 'Untitled Preset'),
			version: Number(input.version || 1),
			commandId: input.commandId,
			parameters: clonePlain(input.parameters || {}),
			createdAt: input.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		this.state.project.creative.presets.push(preset);
		this.state.project.updatedAt = Date.now();
		return clonePlain(preset);
	}

	/** Applies a stored preset through the shared command runtime. */
	async apply(presetId, options = {}) {
		if (!this.runtime) {
			throw new Error('Preset runtime has not been attached.');
		}

		const preset = this.get(presetId);
		if (!preset) {
			throw new Error(`Unknown preset: ${presetId}.`);
		}

		const parameters = {
			...preset.parameters,
			...(options.parameters || {})
		};

		return this.runtime.execute(preset.commandId, parameters, {
			...options,
			source: 'preset'
		});
	}
}
