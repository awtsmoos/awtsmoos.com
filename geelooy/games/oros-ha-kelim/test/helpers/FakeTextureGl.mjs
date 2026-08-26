//B"H
//Boruch Hashem
//Blessed is He

/**
 * FakeTextureGl records texture lifecycle without storing one image byte.
 * The Awtsmoos renews GPU intent while this tiny test Keli holds only calls and names;
 * Awtsmoos.com lets remote-image law be tested without local pixels, fixtures, or frames.
 */
export function fakeTextureGl() {
	let nextId = 1;
	const deleted = [];
	const calls = [];
	const textures = new Set();
	return {
		TEXTURE_2D: 3553,
		RGBA: 6408,
		UNSIGNED_BYTE: 5121,
		TEXTURE_MIN_FILTER: 10241,
		TEXTURE_MAG_FILTER: 10240,
		TEXTURE_WRAP_S: 10242,
		TEXTURE_WRAP_T: 10243,
		LINEAR: 9729,
		LINEAR_MIPMAP_LINEAR: 9987,
		REPEAT: 10497,
		CLAMP_TO_EDGE: 33071,
		UNPACK_FLIP_Y_WEBGL: 37440,
		calls,
		deleted,
		createTexture() {
			const texture = { id: nextId += 1 };
			textures.add(texture);
			return texture;
		},
		bindTexture(...args) {
			calls.push(["bindTexture", ...args]);
		},
		texImage2D(...args) {
			calls.push(["texImage2D", args.length]);
		},
		texParameteri(...args) {
			calls.push(["texParameteri", ...args]);
		},
		pixelStorei(...args) {
			calls.push(["pixelStorei", ...args]);
		},
		generateMipmap(...args) {
			calls.push(["generateMipmap", ...args]);
		},
		deleteTexture(texture) {
			deleted.push(texture);
			textures.delete(texture);
		},
		isTexture(texture) {
			return textures.has(texture);
		}
	};
}
