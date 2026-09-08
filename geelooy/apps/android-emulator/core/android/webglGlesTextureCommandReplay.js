//B"H
//Boruch Hashem
//Blessed is He

import { resolveWebGlGlesTexture } from "./webglGlesDefaultTextures.js";
import { createWebGlGlesPixelData } from "./webglGlesPixelData.js";

/**
 * Replays guest texture parameters, storage, subimages, and mipmaps on genuine WebGL2.
 * The Awtsmoos renews exact bound resources while Awtsmoos.com adds no host-generated image or state.
 */
export function replayWebGlGlesTextureCommand(gl, state, operation) {
	const handlers = {
		"generate-mipmap": () => generateMipmap(gl, state, operation),
		"tex-storage-2d": () => textureStorage2d(gl, state, operation),
		"tex-sub-image-2d": () => textureSubImage2d(gl, state, operation),
		"texture-parameter": () => textureParameter(gl, state, operation)
	};
	const handler = handlers[operation?.kind];
	if (!handler) return Object.freeze({ applied: false, handled: false });
	return Object.freeze({ applied: Boolean(handler()), handled: true });
}

function textureParameter(gl, state, operation) {
	const texture = resolveWebGlGlesTexture(gl, state, operation.texture, operation.target);
	if (!texture) return false;
	gl.bindTexture(Number(operation.target), texture);
	const method = operation.valueType === "float" ? "texParameterf" : "texParameteri";
	gl[method](Number(operation.target), Number(operation.pname), Number(operation.value));
	return true;
}

function textureStorage2d(gl, state, operation) {
	const texture = state.texture(Number(operation.texture));
	if (!texture) return false;
	gl.bindTexture(Number(operation.target), texture);
	gl.texStorage2D(Number(operation.target), Number(operation.levels), Number(operation.internalFormat), Number(operation.width), Number(operation.height));
	return true;
}

function textureSubImage2d(gl, state, operation) {
	const texture = resolveWebGlGlesTexture(gl, state, operation.texture, operation.bindingTarget);
	if (!texture) return false;
	const pixels = createWebGlGlesPixelData(operation.pixels, operation.type);
	if (operation.pixels !== null && pixels === undefined) return false;
	gl.bindTexture(Number(operation.bindingTarget), texture);
	gl.texSubImage2D(
		Number(operation.target), Number(operation.level), Number(operation.xoffset), Number(operation.yoffset),
		Number(operation.width), Number(operation.height), Number(operation.format), Number(operation.type), pixels
	);
	return true;
}

function generateMipmap(gl, state, operation) {
	const texture = resolveWebGlGlesTexture(gl, state, operation.texture, operation.target);
	if (!texture) return false;
	gl.bindTexture(Number(operation.target), texture);
	gl.generateMipmap(Number(operation.target));
	return true;
}
