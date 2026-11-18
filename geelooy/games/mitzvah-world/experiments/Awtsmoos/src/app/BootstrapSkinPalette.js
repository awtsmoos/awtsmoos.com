// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapSkinPalette.js
 * @description Owns the GPU bone texture the first-frame renderer needs to skin
 * the canonical Chossid before the rich renderer hydrates. One 4-wide RGBA
 * float texture per skeleton, laid out exactly like the rich renderer's
 * upload (tiny-render-skin-upload.js): each joint is one row, its four
 * texels the four columns of the joint matrix, fetched by jointAt in the
 * skinning vertex shader. The texture uploads only when the skeleton's
 * palette revision changes, so a still figure costs no upload at all.
 */

export const BOOTSTRAP_SKIN_TEXTURE_UNIT = 1;
export const BOOTSTRAP_SKIN_MAX_JOINTS = 96;

export class BootstrapSkinPalette {
	constructor(gl) {
		this.gl = gl;
		this.textures = new WeakMap();
		this.records = new Set();
		this.skinSupported = detectSkinSupport(gl);
	}

	/**
	 * Refreshes the skeleton palette, uploads the bone texture when its
	 * revision changed, and binds it to the skin texture unit.
	 * @param {object} skeleton TinySkeleton with updateCached and jointMatrices.
	 * @param {Float32Array|Array} meshWorld Mesh world matrix.
	 * @param {number} frameToken Renderer frame counter.
	 * @param {object} locations Skin program locations.
	 * @returns {boolean} True when the bone texture is bound and skinning may draw.
	 */
	bind(skeleton, meshWorld, frameToken, locations) {
		if (!this.skinSupported || !skeleton?.updateCached) return false;
		const gl = this.gl;
		skeleton.updateCached(meshWorld, frameToken);
		const joints = skeleton.jointMatrices || skeleton.joints;
		const jointCount = Math.min(skeleton.jointCount || 0, BOOTSTRAP_SKIN_MAX_JOINTS);
		if (!joints || jointCount <= 0) return false;
		let record = this.textures.get(skeleton);
		if (!record) {
			const texture = gl.createTexture();
			if (!texture) return false;
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			record = { texture, revision: -1 };
			this.textures.set(skeleton, record);
			this.records.add(record);
		}
		if (skeleton.paletteRevision !== record.revision) {
			gl.bindTexture(gl.TEXTURE_2D, record.texture);
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA,
				4, jointCount, 0,
				gl.RGBA, gl.FLOAT, joints
			);
			record.revision = skeleton.paletteRevision;
		}
		gl.activeTexture(gl.TEXTURE0 + BOOTSTRAP_SKIN_TEXTURE_UNIT);
		gl.bindTexture(gl.TEXTURE_2D, record.texture);
		if (locations.jointTexture) {
			gl.uniform1i(locations.jointTexture, BOOTSTRAP_SKIN_TEXTURE_UNIT);
		}
		if (locations.jointTextureHeight) {
			gl.uniform1f(locations.jointTextureHeight, jointCount);
		}
		return true;
	}

	dispose() {
		for (const record of this.records) {
			try { this.gl.deleteTexture(record.texture); } catch (error) { /* already gone */ }
		}
		this.records.clear();
		this.textures = new WeakMap();
	}
}

/**
 * Skinning needs float textures readable from the vertex shader. WebGL 1
 * exposes both through OES_texture_float and a nonzero vertex texture
 * unit count; without either, the caller falls back to rigid drawing.
 */
function detectSkinSupport(gl) {
	try {
		if (!gl.getExtension?.('OES_texture_float')) return false;
		const units = gl.getParameter?.(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
		return Number.isFinite(units) && units > 0;
	} catch (error) {
		return false;
	}
}
