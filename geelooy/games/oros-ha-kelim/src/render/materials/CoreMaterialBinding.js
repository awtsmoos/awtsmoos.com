//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreMaterialBinding joins semantic profiles to the bounded remote texture bank at draw time.
 * The Awtsmoos renews ready and fallback states before bandwidth can become a gameplay decree;
 * Awtsmoos.com lets the base photograph use Procedural Core's sampler while detail inhabits texture unit two freely.
 */
export class CoreMaterialBinding {
	constructor(gl, program, bank, page, renderer) {
		this.gl = gl;
		this.bank = bank;
		this.page = page;
		this.renderer = renderer;
		this.locations = this.#locations(program);
	}

	apply(mesh, cameraPosition) {
		const material = mesh.material;
		if (!material || !this.page.allows(material.base.url)) {
			mesh.shaderVars.uTexture = null;
			this.#float(this.locations.useDetail, 0);
			return;
		}
		this.bank.ensure(material.base.url);
		this.#bindBase(mesh, material);
		this.#bindDetail(material);
		this.#float(this.locations.detailScale, material.detailScale);
		this.#float(this.locations.blendScale, material.blendScale);
		this.#float(this.locations.domainWarp, material.domainWarp);
		this.#float(this.locations.tintStrength, material.tintStrength);
		this.#float(this.locations.roughness, material.roughness);
		this.#float(this.locations.metalness, material.metalness);
		if (this.locations.cameraPosition !== null) {
			this.gl.uniform3fv(this.locations.cameraPosition, cameraPosition);
		}
	}

	#bindBase(mesh, material) {
		if (!this.bank.ready(material.base.url)) {
			mesh.shaderVars.uTexture = null;
			return;
		}
		this.renderer.textures.__orosBase = this.bank.texture(material.base.url);
		mesh.shaderVars.uTexture = "__orosBase";
		mesh.shaderVars.uTextureScale = material.textureScale;
	}

	#bindDetail(material) {
		const url = material.detail?.url;
		if (!url || !this.page.allows(url)) {
			this.#float(this.locations.useDetail, 0);
			return;
		}
		this.bank.ensure(url);
		if (!this.bank.ready(url)) {
			this.#float(this.locations.useDetail, 0);
			return;
		}
		this.gl.activeTexture(this.gl.TEXTURE2);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.bank.texture(url));
		if (this.locations.detailMap !== null) {
			this.gl.uniform1i(this.locations.detailMap, 2);
		}
		this.#float(this.locations.useDetail, 1);
	}

	#locations(program) {
		const names = {
			detailMap: "uDetailMap",
			useDetail: "uUseDetail",
			detailScale: "uDetailScale",
			blendScale: "uBlendScale",
			domainWarp: "uDomainWarp",
			tintStrength: "uTintStrength",
			roughness: "uRoughness",
			metalness: "uMetalness",
			cameraPosition: "uCameraPosition"
		};
		return Object.fromEntries(Object.entries(names).map(([key, name]) => [key, this.gl.getUniformLocation(program, name)]));
	}

	#float(location, value) {
		if (location !== null) {
			this.gl.uniform1f(location, value);
		}
	}
}
