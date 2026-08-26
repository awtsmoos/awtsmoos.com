// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicsSourceApi3d.js
 * @description Adds deterministic continuous water sources and semantic placement above one-shot conserved-water emission.
 * The Awtsmoos renews every wellspring only as simulation time advances; Awtsmoos.com keeps fountain, waterfall, hose,
 * and source lifecycle explicit so a paused world emits nothing and each source begins at a physically useful place in its vessel.
 */

import { emitWaterParticles3d } from './emitWaterParticles3d.js';
import { WaterDynamicsEmitterApi3d } from './WaterDynamicsEmitterApi3d.js';
import { waterDefaultEmissionPosition3d } from './WaterGridPlacement3d.js';
import { WaterSourceRegistry3d } from './WaterSourceRegistry3d.js';

/** Continuous-source layer shared by the complete 3D water runtime. */
export class WaterDynamicsSourceApi3d extends WaterDynamicsEmitterApi3d {
	constructor(options = {}) {
		super(options);
		this._sources = new WaterSourceRegistry3d(this.seed);
		this._lastSourceReports = Object.freeze([]);
	}

	/** Returns immutable snapshots of every registered continuous source. */
	get sources() {
		return this._sources.list();
	}

	/** Returns emission accounting from the most recent timestep's continuous sources. */
	get lastSourceReports() {
		return this._lastSourceReports;
	}

	/** Registers a continuous source and returns its stable id. */
	source(kind = 'spring', options = {}) {
		const hasPosition = Array.isArray(options.position) || Array.isArray(options.center);
		const sourceOptions = {
			...options,
			position: hasPosition
				? options.position ?? options.center
				: waterDefaultEmissionPosition3d(this._state, kind)
		};
		return this._sources.add(kind, sourceOptions);
	}

	/** Removes one continuous source. */
	stopSource(id) {
		return this._sources.remove(id);
	}

	/** Enables or pauses one source without losing deterministic sequence state. */
	setSourceEnabled(id, enabled) {
		return this._sources.setEnabled(id, enabled);
	}

	/** Registers a continuous spring/wellspring. */
	wellspring(options = {}) {
		return this.source('spring', options);
	}

	/** Registers a continuous elevated fountain jet. */
	fountain(options = {}) {
		return this.source('jet', { speed: 6, ...options });
	}

	/** Registers a continuous falling pour suitable for a waterfall/nozzle edge. */
	waterfall(options = {}) {
		return this.source('pour', { direction: [0, -1, 0], ...options });
	}

	/** Registers a continuous directional hose jet. */
	hose(options = {}) {
		return this.source('jet', options);
	}

	/** Emits all active continuous sources for one explicit timestep and stores exact reports. */
	_emitContinuousSources(deltaTime) {
		const reports = [];
		for (const spec of this._sources.emissions(deltaTime)) {
			const result = emitWaterParticles3d(this._state, spec);
			this._state = result.state;
			reports.push(result.report);
		}
		this._lastSourceReports = Object.freeze(reports);
		return this._lastSourceReports;
	}
}
