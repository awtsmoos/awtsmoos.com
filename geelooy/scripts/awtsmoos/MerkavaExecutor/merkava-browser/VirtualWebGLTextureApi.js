//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== 'undefined' ? self : this, function() {
	/**
	 * Installs texture object, active-unit, upload, storage, parameter, and pixel
	 * store recording. Validation rejects impossible active units and unbound
	 * texture uploads before future native backends receive unsafe operations.
	 * @param {Function} Context Virtual context constructor.
	 * @returns {void}
	 */
	function installWebGLTextureApi(Context) {
		Object.assign(Context.prototype, {
			createTexture() {
				const texture = this.object('texture', { deleted: false, parameters: new Map() });
				this.record('createTexture', { id: texture.id });
				return texture;
			},
			activeTexture(texture) {
				const unit = Number(texture) - this.TEXTURE0;
				if (unit < 0 || unit >= 32) return this.invalid(this.INVALID_ENUM, 'activeTexture', { texture });
				this.activeTextureValue = texture;
				this.activeTextureUnit = unit;
				this.record('activeTexture', { texture, unit });
			},
			bindTexture(target, texture) {
				if (!textureTarget(this, target)) return this.invalid(this.INVALID_ENUM, 'bindTexture', { target });
				if (texture && !this.validObject(texture, 'texture')) return this.invalid(this.INVALID_OPERATION, 'bindTexture');
				this.boundTextures.set(textureKey(this, target), texture || null);
				this.record('bindTexture', { target, id: texture?.id ?? null, unit: this.activeTextureUnit });
			},
			texParameteri(target, pname, param) {
				return textureParameter(this, 'texParameteri', target, pname, param);
			},
			texParameterf(target, pname, param) {
				return textureParameter(this, 'texParameterf', target, pname, param);
			},
			texImage2D() {
				return upload(this, 'texImage2D', arguments);
			},
			texSubImage2D() {
				return upload(this, 'texSubImage2D', arguments);
			},
			texImage3D() {
				return upload(this, 'texImage3D', arguments);
			},
			texSubImage3D() {
				return upload(this, 'texSubImage3D', arguments);
			},
			compressedTexImage2D() {
				return upload(this, 'compressedTexImage2D', arguments);
			},
			compressedTexImage3D() {
				return upload(this, 'compressedTexImage3D', arguments);
			},
			pixelStorei(pname, param) {
				this.pixelStore.set(pname, param);
				this.record('pixelStorei', { pname, param });
			},
			generateMipmap(target) {
				if (!boundTexture(this, target)) return this.invalid(this.INVALID_OPERATION, 'generateMipmap', { target });
				this.record('generateMipmap', { target });
			},
			deleteTexture(texture) {
				if (this.validObject(texture, 'texture')) texture.deleted = true;
				this.record('deleteTexture', { id: texture?.id ?? null });
			},
			isTexture(texture) {
				return this.validObject(texture, 'texture');
			}
		});
	}

	/** @returns {boolean} */
	function textureTarget(gl, target) {
		return [gl.TEXTURE_2D, gl.TEXTURE_CUBE_MAP, gl.TEXTURE_3D, gl.TEXTURE_2D_ARRAY].includes(target);
	}
	/** @returns {string} */
	function textureKey(gl, target) {
		return `${gl.activeTextureUnit}:${target}`;
	}
	/** @returns {object|null} */
	function boundTexture(gl, target) {
		return gl.boundTextures.get(textureKey(gl, target)) || null;
	}
	/** @returns {void} */
	function textureParameter(gl, op, target, pname, param) {
		const texture = boundTexture(gl, target);
		if (!texture) return gl.invalid(gl.INVALID_OPERATION, op, { target });
		texture.parameters.set(pname, param);
		gl.record(op, { target, pname, param });
	}
	/** @returns {void} */
	function upload(gl, op, argsLike) {
		const args = Array.from(argsLike);
		const target = args[0];
		if (!boundTexture(gl, target)) return gl.invalid(gl.INVALID_OPERATION, op, { target });
		gl.record(op, { target, args: args.length });
	}

	return { installWebGLTextureApi };
});
