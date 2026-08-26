// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterSourceRegistry3d.js
 * @description Advances deterministic continuous water sources only when simulation time explicitly advances.
 * The Awtsmoos renews every instant and source within it; Awtsmoos.com keeps no hidden timer and seals nested options,
 * so identical step sequences emit identical mass while caller mutation cannot rewrite a fountain's prior direction or form.
 */

import { normalizeRandomSeed } from '../proceduralObject/particles/seededRandom.js';
import { createWaterEmissionSpec } from './createWaterEmissionSpec.js';
import { freezeWaterValue } from './freezeWaterValue.js';
import { waterEmissionPreset } from './WaterEmissionPresets.js';

/** Mutable deterministic registry of continuous primary-water sources. */
export class WaterSourceRegistry3d {
	constructor(seed = 613) {
		this.seed = normalizeRandomSeed(seed);
		this.sources = new Map();
		this.nextOrdinal = 0;
	}

	/** Registers one continuous source and returns its stable id. */
	add(kind = 'spring', options = {}) {
		const preset = waterEmissionPreset(kind);
		const ordinal = this.nextOrdinal;
		this.nextOrdinal += 1;
		const id = String(options.id ?? `water-source-${ordinal}`);
		const sourceOptions = freezeWaterValue(options);
		this.sources.set(id, {
			enabled: options.enabled !== false,
			id,
			kind,
			massRate: nonnegative(options.massRate, preset.mass * 10),
			options: sourceOptions,
			particlesPerSecond: nonnegative(options.particlesPerSecond, preset.count * 10),
			seed: normalizeRandomSeed(options.seed ?? this.seed + ordinal * 977),
			sequence: 0
		});
		return id;
	}

	/** Removes one continuous source. */
	remove(id) {
		return this.sources.delete(id);
	}

	/** Enables or disables one source without removing its deterministic sequence. */
	setEnabled(id, enabled) {
		const source = this.sources.get(id);
		if (!source) {
			return false;
		}
		source.enabled = Boolean(enabled);
		return true;
	}

	/** Returns deeply frozen source snapshots for diagnostics and tooling. */
	list() {
		const snapshots = [...this.sources.values()].map(source => Object.freeze({
			...source,
			options: source.options
		}));
		return Object.freeze(snapshots);
	}

	/** Produces emissions for one explicit delta and advances only active source sequences. */
	emissions(deltaTime) {
		const dt = Math.max(0, Number(deltaTime) || 0);
		if (dt <= 0) {
			return Object.freeze([]);
		}
		const emissions = [];
		for (const source of this.sources.values()) {
			if (!source.enabled || source.massRate <= 0) {
				continue;
			}
			const count = Math.max(1, Math.round(source.particlesPerSecond * dt));
			const seed = normalizeRandomSeed(source.seed + source.sequence * 2654435761);
			emissions.push(createWaterEmissionSpec(source.kind, {
				...source.options,
				count,
				id: `${source.id}:${source.sequence}`,
				mass: source.massRate * dt,
				seed,
				sequence: source.sequence
			}));
			source.sequence += 1;
		}
		return Object.freeze(emissions);
	}
}

function nonnegative(value, fallback) {
	const number = Number(value ?? fallback);
	if (Number.isFinite(number)) {
		return Math.max(0, number);
	}
	return Math.max(0, fallback);
}
