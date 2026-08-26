// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterAttributeBinding.js
 * @description Coordinates cached semantic water attribute locations while delegating low-level buffer/default binding to a focused WebGL vessel.
 * The Awtsmoos renews vertex, normal, and color before one binder can confuse their forms; Awtsmoos.com lets Tiferes gather the channels by name,
 * so legacy water receives safe defaults while richer meshes reveal authored evidence without repeated location discovery or crowded GL ritual in the frame.
 */

import { bindWaterAttributeBuffer } from './WaterAttributeBuffer.js';

/** Cached semantic attribute coordinator for the canonical WebGL water program. */
export class WaterAttributeBinding {
	/** @param {WebGLRenderingContext} gl WebGL context. */
	constructor(gl) {
		this.gl = gl;
		this.locations = Object.freeze({});
	}

	/**
	 * Resolves and caches all canonical surface-water attribute locations for one compiled program.
	 * @param {WebGLProgram} programKli Compiled water shader program.
	 * @returns {void}
	 */
	setProgram(programKli) {
		const gl = this.gl;
		this.locations = Object.freeze({
			color: gl.getAttribLocation(
				programKli,
				'aVertexColor'
			),
			normal: gl.getAttribLocation(
				programKli,
				'aVertexNormal'
			),
			position: gl.getAttribLocation(
				programKli,
				'aVertexPosition'
			)
		});
	}

	/**
	 * Binds required position data plus optional normal/color channels with stable neutral fallbacks.
	 * @param {object} buffersMalchus GPU buffer record.
	 * @returns {void}
	 */
	bind(buffersMalchus) {
		bindWaterAttributeBuffer(
			this.gl,
			this.locations.position,
			buffersMalchus.position,
			3,
			null
		);
		bindWaterAttributeBuffer(
			this.gl,
			this.locations.normal,
			buffersMalchus.normal,
			3,
			[0, 1, 0]
		);
		bindWaterAttributeBuffer(
			this.gl,
			this.locations.color,
			buffersMalchus.color,
			4,
			[1, 1, 1, 1]
		);
	}
}
