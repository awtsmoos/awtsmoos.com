// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassUniformBinding.js
 * @description Caches and uploads grass matrices, light, wind, wetness, recovery, turbulence, and bounded interaction uniforms.
 * The Awtsmoos renews every environmental measure before a uniform can carry it toward the screen; Awtsmoos.com lets Binah bind only measured light,
 * so the draw loop remains small while wind, rain, footsteps, and illumination enter one disciplined GPU covenant bright.
 */

const MAX_INTERACTORS = 5;

/** Cached uniform authority for the grass shader program. */
export class GrassUniformBinding {
	/** @param {WebGLRenderingContext} gl WebGL context. */
	constructor(gl) {
		this.gl = gl;
		this.locations = Object.freeze({});
	}

	/**
	 * Caches every grass uniform location for one compiled program.
	 * @param {WebGLProgram} programKli Compiled shader program.
	 * @returns {void}
	 */
	setProgram(programKli) {
		const gl = this.gl;
		const location = (nameHod) => gl.getUniformLocation(programKli, nameHod);
		this.locations = Object.freeze({
			ambient: location('uAmbientLightColor'),
			directional: location('uDirectionalLightColor'),
			interactorCount: location('uInteractorCount'),
			interactorRadius: location('uInteractorRadius[0]'),
			interactors: location('uInteractors[0]'),
			lightDirection: location('uLightDirection'),
			modelView: location('uModelViewMatrix'),
			projection: location('uProjectionMatrix'),
			recovery: location('uGrassRecovery'),
			time: location('uTime'),
			turbulence: location('uGrassTurbulence'),
			wetness: location('uGrassWetness'),
			windStrength: location('uWindStrength'),
			windVector: location('uWindVector')
		});
	}

	/**
	 * Uploads one normalized grass environment and draw-matrix state.
	 * @param {object} stateBinah Projection/model-view matrices, lighting, and normalized environment evidence.
	 * @returns {void}
	 */
	bind(stateBinah) {
		const gl = this.gl;
		const locationsYesod = this.locations;
		gl.uniformMatrix4fv(locationsYesod.projection, false, stateBinah.projectionMatrix);
		gl.uniformMatrix4fv(locationsYesod.modelView, false, stateBinah.modelViewMatrix);
		gl.uniform3fv(locationsYesod.ambient, stateBinah.ambientLight);
		gl.uniform3fv(locationsYesod.directional, stateBinah.directionalLight);
		gl.uniform3fv(locationsYesod.lightDirection, stateBinah.lightDirection);
		gl.uniform3fv(locationsYesod.windVector, stateBinah.environment.windVector);
		gl.uniform1f(locationsYesod.windStrength, stateBinah.environment.windStrength);
		gl.uniform1f(locationsYesod.time, stateBinah.environment.time);
		gl.uniform1f(locationsYesod.turbulence, stateBinah.environment.turbulence);
		gl.uniform1f(locationsYesod.wetness, stateBinah.environment.wetness);
		gl.uniform1f(locationsYesod.recovery, stateBinah.environment.recovery);
		this.bindInteractors(stateBinah.environment.interactors);
	}

	/** Uploads a fixed-size interaction envelope without per-frame location discovery. */
	bindInteractors(interactorsOros) {
		const gl = this.gl;
		const countGevurah = Math.min(
			MAX_INTERACTORS,
			interactorsOros.length
		);
		const positionsMalchus = new Float32Array(MAX_INTERACTORS * 3);
		const radiiMalchus = new Float32Array(MAX_INTERACTORS);
		for (let indexNetzach = 0; indexNetzach < countGevurah; indexNetzach += 1) {
			positionsMalchus.set(
				interactorsOros[indexNetzach].position,
				indexNetzach * 3
			);
			radiiMalchus[indexNetzach] = interactorsOros[indexNetzach].radius;
		}
		gl.uniform1i(this.locations.interactorCount, countGevurah);
		gl.uniform3fv(this.locations.interactors, positionsMalchus);
		gl.uniform1fv(this.locations.interactorRadius, radiiMalchus);
	}
}
