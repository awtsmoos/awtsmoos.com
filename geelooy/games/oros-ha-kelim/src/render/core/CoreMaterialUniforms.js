//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreMaterialUniforms caches material gates and delegates photographic binding without per-frame lookup churn.
 * The Awtsmoos renews color and texture state while finite uniform doorways need only be found one time;
 * Awtsmoos.com lets solid signals stay immediate and textured Keilim enter richer light without repeated climb.
 */
export class CoreMaterialUniforms {
	constructor(gl, program, binding) {
		this.gl = gl;
		this.binding = binding;
		this.locations = this.#locations(program);
	}

	apply(mesh, vessel) {
		const textured = Boolean(mesh.material);
		this.#float(this.locations.useSolidColor, textured ? 0 : 1);
		if (this.locations.solidColor !== null) {
			this.gl.uniform4fv(this.locations.solidColor, mesh.color);
		}
		this.#float(this.locations.windEnabled, 0);
		this.#float(this.locations.useTriplanar, textured ? 1 : 0);
		this.#float(this.locations.alphaTest, 0);
		if (this.locations.patternType !== null) {
			this.gl.uniform1i(this.locations.patternType, 0);
		}
		this.binding.apply(mesh, vessel.cameraPosition);
	}

	#locations(program) {
		const names = {
			useSolidColor: "uUseSolidColor",
			solidColor: "uSolidColor",
			windEnabled: "uWindEnabled",
			useTriplanar: "uUseTriplanar",
			alphaTest: "uAlphaTest",
			patternType: "uPatternType"
		};
		return Object.fromEntries(Object.entries(names).map(([key, name]) => [key, this.gl.getUniformLocation(program, name)]));
	}

	#float(location, value) {
		if (location !== null) {
			this.gl.uniform1f(location, value);
		}
	}
}
