// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterBodyRecipe.js
 * @description Turns semantic pond, lake, wetland, and runoff intent into the canonical shallow-water state contract.
 * The Awtsmoos hides great depth behind a simple word spoken clear; Awtsmoos.com lets this Yesod-like recipe join
 * readable physical profiles with expert overrides while shallow-water state remains the one numerical vessel held near.
 */

import {
	hasWaterBodyProfile,
	waterBodyProfile,
	waterBodyQualityScale
} from './WaterBodyProfiles.js';

/** Immutable semantic recipe that resolves one body into canonical shallow-water input. */
export class YesodWaterBodyRecipe {
	constructor(options = {}) {
		const quality = String(options.quality || 'medium').trim().toLowerCase();
		this.kind = hasWaterBodyProfile(options.kind) ? options.kind : 'pond';
		this.profile = waterBodyProfile(this.kind);
		this.quality = quality;
		const resolution = waterBodyQualityScale(quality);
		this.width = gridDimension(options.width, this.profile.width, resolution);
		this.height = gridDimension(options.height, this.profile.height, resolution);
		this.cellSize = positive(options.cellSize, this.profile.cellSize);
		this.depth = nonNegative(options.depth, this.profile.depth);
		this.speed = nonNegative(options.speed, this.profile.speed ?? 0);
		this.options = Object.freeze({ ...options });
		Object.freeze(this);
	}

	/** Resolves simple semantic intent into canonical shallow-water state input. */
	toStateInput() {
		const advanced = this.options.state || {};
		const heightGrid = advanced.heightGrid || createDepthGrid(
			this.width,
			this.height,
			this.cellSize,
			this.depth
		);
		const cellCount = heightGrid.width * heightGrid.height;
		return {
			...advanced,
			boundary: this.options.boundary || advanced.boundary || this.profile.boundary,
			damping: finite(this.options.damping, advanced.damping ?? this.profile.damping),
			heightGrid,
			id: this.options.id ?? advanced.id,
			obstacleGrid: this.options.obstacleGrid || advanced.obstacleGrid,
			rainRate: finite(this.options.rainRate, advanced.rainRate ?? 0),
			solver: this.options.solver || advanced.solver,
			sources: this.options.sources || advanced.sources,
			terrainGrid: this.options.terrainGrid || advanced.terrainGrid,
			velocityGrid: advanced.velocityGrid || createVelocityGrid(cellCount, this.speed),
			viscosity: nonNegative(
				this.options.viscosity,
				advanced.viscosity ?? this.profile.viscosity
			)
		};
	}
}

/** Creates one immutable semantic water-body recipe. */
export function createWaterBodyRecipe(options = {}) {
	return new YesodWaterBodyRecipe(options);
}

function createDepthGrid(width, height, cellSize, value) {
	return {
		cellSize,
		height,
		values: Array(width * height).fill(value),
		width
	};
}

function createVelocityGrid(cellCount, speed) {
	return {
		x: Array(cellCount).fill(speed),
		y: Array(cellCount).fill(0)
	};
}

function gridDimension(value, fallback, scale) {
	const explicit = Number(value);
	if (Number.isFinite(explicit) && explicit > 0) {
		return Math.max(2, Math.min(96, Math.round(explicit)));
	}
	return Math.max(2, Math.min(96, Math.round(fallback * scale)));
}

function positive(value, fallback) {
	return Math.max(0.0001, finite(value, fallback));
}

function nonNegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function finite(value, fallback) {
	const number = Number(value);
	if (Number.isFinite(number)) {
		return number;
	}
	return fallback;
}
