//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreRemoteTextureBank hydrates verified HTTPS photographs into shared native WebGL textures without blocking boot.
 * The Awtsmoos renews image and fallback before a network response can decide whether the game may play;
 * Awtsmoos.com lets one URL become one GPU vessel, cached, measured, and safely released away.
 */
export class CoreRemoteTextureBank {
	constructor(gl, ImageCtor = globalThis.Image) {
		this.gl = gl;
		this.ImageCtor = ImageCtor;
		this.records = new Map();
		this.failures = [];
		this.fallback = this.#fallbackTexture();
	}

	ensure(url) {
		if (!url || !this.ImageCtor) {
			return Promise.resolve(this.fallback);
		}
		if (this.records.has(url)) {
			return this.records.get(url).promise;
		}
		const record = { status: "loading", texture: this.fallback, error: null, promise: null };
		record.promise = new Promise((resolve) => {
			const image = new this.ImageCtor();
			image.crossOrigin = "anonymous";
			image.onload = () => {
				try {
					record.texture = this.#upload(image);
					record.status = "ready";
				} catch (error) {
					this.#fail(url, record, error);
				}
				resolve(record.texture);
			};
			image.onerror = () => {
				this.#fail(url, record, new Error(`Remote texture failed: ${url}`));
				resolve(this.fallback);
			};
			image.src = url;
		});
		this.records.set(url, record);
		return record.promise;
	}

	texture(url) {
		return this.records.get(url)?.texture || this.fallback;
	}

	ready(url) {
		return this.records.get(url)?.status === "ready";
	}

	stats() {
		const records = [...this.records.values()];
		return {
			remoteTexturesRequested: records.length,
			remoteTexturesReady: records.filter((record) => record.status === "ready").length,
			remoteTextureFailures: this.failures.length
		};
	}

	dispose() {
		const textures = new Set([this.fallback]);
		for (const record of this.records.values()) {
			textures.add(record.texture);
		}
		for (const texture of textures) {
			if (texture && (!this.gl.isTexture || this.gl.isTexture(texture))) {
				this.gl.deleteTexture(texture);
			}
		}
		this.records.clear();
	}

	#fallbackTexture() {
		const texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		return texture;
	}

	#upload(image) {
		const gl = this.gl;
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		if (gl.UNPACK_FLIP_Y_WEBGL !== undefined) {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		}
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		const repeat = this.#powerOfTwo(image.width) && this.#powerOfTwo(image.height);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, repeat ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
		if (repeat) {
			gl.generateMipmap(gl.TEXTURE_2D);
		}
		return texture;
	}

	#fail(url, record, error) {
		record.status = "failed";
		record.error = error;
		this.failures.push({ url, message: error.message });
	}

	#powerOfTwo(value) {
		return value > 0 && (value & (value - 1)) === 0;
	}
}
