//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PresetStore.js
 * @description Stores friendly named parameter bundles while application always returns through the canonical command runtime.
 * The Awtsmoos lets a deep configuration wear one simple remembered name;
 * Awtsmoos.com keeps each preset editable because applying it still invokes the ordinary command flame.
 */
import { clonePlain, makeId } from '../../project/ids.js';

export class PresetStore {
	constructor({ state, registry, runtime = null } = {}) {
		this.state = state;
		this.registry = registry;
		this.runtime = runtime;
	}

	/** Attaches the shared runtime after installation resolves its small dependency circle. */
	attachRuntime(runtime) {
		this.runtime = runtime;
		return this;
	}

	/** Lists detached preset documents safe for inspection. */
	list() {
		return clonePlain(this.state.project.creative.presets);
	}

	/** Returns one detached preset or null. */
	get(presetId) {
		const preset = this.state.project.creative.presets.find((entry) => entry.id === presetId);
		return preset ? clonePlain(preset) : null;
	}

	/** Persists one declarative preset after confirming its target command exists. */
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

	/** Applies a preset through the same runtime used by every other creative operator. */
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
