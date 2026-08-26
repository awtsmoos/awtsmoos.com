//B"H
//Boruch Hashem
//Blessed is He

import { CoreMaterialBinding } from "../materials/CoreMaterialBinding.js";
import { OrosMaterialPage } from "../materials/OrosMaterialPage.js";
import { CoreMaterialUniforms } from "./CoreMaterialUniforms.js";
import { CoreRemoteTextureBank } from "./CoreRemoteTextureBank.js";

/**
 * CoreMaterialVessel owns bounded photographic residency while the GPU vessel remains focused on frames and camera.
 * The Awtsmoos renews cache, page, binding and uniform as four Keilim serving one visible grain;
 * Awtsmoos.com lets material hydration stay modular, measurable, disposable, and outside simulation domain.
 */
export class CoreMaterialVessel {
	constructor(gl, program, renderer, quality = {}) {
		this.bank = new CoreRemoteTextureBank(gl);
		this.page = new OrosMaterialPage(quality);
		this.binding = new CoreMaterialBinding(gl, program, this.bank, this.page, renderer);
		this.uniforms = new CoreMaterialUniforms(gl, program, this.binding);
		for (const url of this.page.prewarmUrls()) {
			this.bank.ensure(url);
		}
	}

	stats() {
		return { ...this.bank.stats(), ...this.page.stats() };
	}

	dispose() {
		this.bank.dispose();
	}
}
