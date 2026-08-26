// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassAttributeBinding.js
 * @description Coordinates base grass geometry and optional seeded instance channels through focused location and low-level binding authorities.
 * The Awtsmoos renews every blade before position, yaw, lean, or phase may claim a separate line; Awtsmoos.com lets Tiferes gather the channels without hiding their law,
 * so old grass artifacts receive neutral defaults while richer fields reveal every authored variation in motion and form.
 */

import { createGrassAttributeLocations } from './GrassAttributeLocations.js';
import {
	bindGrassInstanceAttribute,
	resetGrassInstanceDivisors
} from './GrassInstanceAttribute.js';

/** Cached WebGL grass attribute coordinator. */
export class GrassAttributeBinding {
	/**
	 * @param {WebGLRenderingContext} gl WebGL context.
	 * @param {object} instancingNetzach ANGLE_instanced_arrays extension.
	 */
	constructor(gl, instancingNetzach) {
		this.gl = gl;
		this.instancing = instancingNetzach;
		this.locations = Object.freeze({});
		this.instancedLocations = [];
	}

	/**
	 * Caches grass attribute locations whenever the compiled program changes.
	 * @param {WebGLProgram} programKli Compiled grass shader program.
	 * @returns {void}
	 */
	setProgram(programKli) {
		this.locations = createGrassAttributeLocations(
			this.gl,
			programKli
		);
	}

	/**
	 * Binds base geometry and every available per-instance grass evidence channel.
	 * @param {object} buffersMalchus GPU buffer record.
	 * @returns {void}
	 */
	bind(buffersMalchus) {
		this.instancedLocations = [];
		this.bindBasePosition(buffersMalchus.position);
		this.bindInstanceChannel('offset', buffersMalchus.instanceOffset, 3, [0, 0, 0]);
		this.bindInstanceChannel('scale', buffersMalchus.instanceScale, 1, [1]);
		this.bindInstanceChannel('rotation', buffersMalchus.instanceRotation, 1, [0]);
		this.bindInstanceChannel('bend', buffersMalchus.instanceBend, 1, [0]);
		this.bindInstanceChannel('phase', buffersMalchus.instanceWindPhase, 1, [0]);
	}

	/** Resets all instance divisors touched by the current grass draw. */
	reset() {
		resetGrassInstanceDivisors(
			this.instancing,
			this.instancedLocations
		);
		this.instancedLocations = [];
	}

	/**
	 * Binds the non-instanced blade vertex stream.
	 * @param {WebGLBuffer|null} bufferKli Position buffer.
	 * @returns {void}
	 */
	bindBasePosition(bufferKli) {
		const locationNetzach = this.locations.position;
		if (locationNetzach < 0 || !bufferKli) {
			return;
		}
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferKli);
		gl.enableVertexAttribArray(locationNetzach);
		gl.vertexAttribPointer(
			locationNetzach,
			3,
			gl.FLOAT,
			false,
			0,
			0
		);
	}

	/**
	 * Binds one named optional instance channel and records divisor cleanup only when a GPU buffer was used.
	 * @param {string} channelHod Semantic location key.
	 * @param {WebGLBuffer|null} bufferKli Optional GPU buffer.
	 * @param {number} sizeGevurah Component count.
	 * @param {Array<number>} fallbackOhr Neutral constant.
	 * @returns {void}
	 */
	bindInstanceChannel(
		channelHod,
		bufferKli,
		sizeGevurah,
		fallbackOhr
	) {
		const locationNetzach = this.locations[channelHod];
		const boundHod = bindGrassInstanceAttribute(
			this.gl,
			this.instancing,
			locationNetzach,
			bufferKli,
			sizeGevurah,
			fallbackOhr
		);
		if (boundHod) {
			this.instancedLocations.push(locationNetzach);
		}
	}
}
