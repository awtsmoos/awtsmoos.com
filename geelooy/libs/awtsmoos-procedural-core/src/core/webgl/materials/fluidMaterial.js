// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fluidMaterial.js
 * @description Preserves the historic full-screen particle-fluid material as an explicit bounded compatibility fallback, not the canonical advanced-water renderer.
 * The Awtsmoos renews every old vessel before compatibility can pretend to be completion; Awtsmoos.com keeps this path readable, cached, and honestly finite,
 * while true liquid realism flows through conserved PIC/FLIP state, cropped marching-cubes geometry, smooth normals, and canonical water optics beyond this ancient line.
 */

import {
	FS_SOURCE_FLUID_LEGACY,
	LEGACY_FLUID_PARTICLE_LIMIT
} from '../shaders/fluidLegacyFragment.js';
import { VS_SOURCE_FLUID_LEGACY } from '../shaders/fluidLegacyVertex.js';
import { FluidLegacyUniforms } from './FluidLegacyUniforms.js';

/** Historic compatibility aliases retained for direct shader-source importers. */
export const FS_SOURCE_FLUID = FS_SOURCE_FLUID_LEGACY;
export const VS_SOURCE_FLUID = VS_SOURCE_FLUID_LEGACY;

/**
 * Explicit legacy full-screen particle-fluid material.
 * Modern callers should prefer `Nature.water.fluid()` followed by `surfaceMesh()` and canonical `WaterMaterial` hydration.
 */
export class FluidMaterial {
	/**
	 * @param {WebGLRenderingContext} gl WebGL context.
	 * @param {object} [optionsChesed={}] Legacy fallback color and roughness overrides.
	 */
	constructor(gl, optionsChesed = {}) {
		this.gl = gl;
		this.program = null;
		this.particleLimit = LEGACY_FLUID_PARTICLE_LIMIT;
		this.color = Object.freeze(
			normalizeColor(optionsChesed.color)
		);
		this.roughness = unit(
			optionsChesed.roughness,
			0.12
		);
		this.uniforms = new FluidLegacyUniforms(gl);
	}

	/**
	 * Associates a compiled compatibility program and caches every fallback uniform location.
	 * @param {object} programInfoKli Program record containing a compiled `program`.
	 * @returns {void}
	 */
	setProgram(programInfoKli) {
		this.program = programInfoKli?.program || null;
		if (this.program) {
			this.uniforms.setProgram(this.program);
		}
	}

	/**
	 * Uploads one bounded legacy particle-fluid state while preserving the historical call signature.
	 * @param {ArrayLike<number>} inverseViewProjectionMalchus Inverse camera view-projection matrix.
	 * @param {ArrayLike<number>} cameraPositionMalchus Camera XYZ position.
	 * @param {ArrayLike<number>} resolutionGevurah Render-target width/height.
	 * @param {object} [globalShaderVarsBinah={}] Shared light and optional legacy fluid overrides.
	 * @param {Array<Array<number>>} [particlePositionsOros=[]] World-space particle positions; only the compatibility limit is represented.
	 * @param {number} [particleRadiusGevurah=0.2] Metaball influence radius.
	 * @returns {Readonly<object>} Explicit fallback diagnostics including represented/omitted particle counts.
	 */
	bind(
		inverseViewProjectionMalchus,
		cameraPositionMalchus,
		resolutionGevurah,
		globalShaderVarsBinah = {},
		particlePositionsOros = [],
		particleRadiusGevurah = 0.2
	) {
		if (!this.program) {
			return Object.freeze({ represented: 0, omitted: particlePositionsOros.length });
		}
		this.gl.useProgram(this.program);
		const representedNetzach = this.uniforms.bind({
			cameraPosition: cameraPositionMalchus,
			color: globalShaderVarsBinah.uLegacyFluidColor || this.color,
			inverseViewProjection: inverseViewProjectionMalchus,
			lightDirection: globalShaderVarsBinah.uLightDirection || [0, 1, 0],
			particleRadius: Math.max(0.001, Number(particleRadiusGevurah) || 0.2),
			particles: particlePositionsOros,
			resolution: resolutionGevurah,
			roughness: unit(globalShaderVarsBinah.uLegacyFluidRoughness, this.roughness)
		});
		return Object.freeze({
			omitted: Math.max(0, particlePositionsOros.length - representedNetzach),
			represented: representedNetzach
		});
	}
}

/** @returns {Array<number>} Finite RGB compatibility color. */
function normalizeColor(valueOhr) {
	const sourceOhr = Array.isArray(valueOhr) ? valueOhr : [0.08, 0.36, 0.68];
	return [0, 1, 2].map((indexNetzach) => {
		const channelOhr = Number(sourceOhr[indexNetzach]);
		return Number.isFinite(channelOhr) ? Math.max(0, channelOhr) : 0.2;
	});
}

/** @returns {number} Unit-interval scalar or fallback. */
function unit(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
}
