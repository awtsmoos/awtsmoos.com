//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreMaterialUniforms resolves Oros-specific shader locations once instead of once per mesh per frame.
 * The Awtsmoos renews every color while the finite doorway to the shader need only be found one time;
 * Awtsmoos.com lets native WebGL spend its breath drawing light instead of repeating the same climb.
 */
export class CoreMaterialUniforms {
	constructor(gl, program) {
		this.gl = gl;
		this.locations = Object.freeze({
			useSolidColor: gl.getUniformLocation(program, "uUseSolidColor"),
			solidColor: gl.getUniformLocation(program, "uSolidColor"),
			windEnabled: gl.getUniformLocation(program, "uWindEnabled"),
			useTriplanar: gl.getUniformLocation(program, "uUseTriplanar"),
			alphaTest: gl.getUniformLocation(program, "uAlphaTest"),
			patternType: gl.getUniformLocation(program, "uPatternType")
		});
	}

	/** @param {number[]} color Current semantic solid RGBA. */
	apply(color) {
		const gl = this.gl;
		const location = this.locations;
		this.#float(location.useSolidColor, 1);
		if (location.solidColor !== null) {
			gl.uniform4fv(location.solidColor, color);
		}
		this.#float(location.windEnabled, 0);
		this.#float(location.useTriplanar, 0);
		this.#float(location.alphaTest, 0);
		if (location.patternType !== null) {
			gl.uniform1i(location.patternType, 0);
		}
	}

	#float(location, value) {
		if (location !== null) {
			this.gl.uniform1f(location, value);
		}
	}
}
