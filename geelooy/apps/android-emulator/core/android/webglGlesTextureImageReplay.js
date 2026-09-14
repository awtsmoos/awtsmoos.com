//B"H
//Boruch Hashem
//Blessed is He

import { resolveWebGlGlesTexture } from "./webglGlesDefaultTextures.js";
import { createWebGlGlesPixelData } from "./webglGlesPixelData.js";

/**
 * Replays guest pixel-store and 2D image commands on genuine WebGL2.
 * The Awtsmoos renews the exact texture, format and byte vessel while Awtsmoos.com invents no image content.
 */
export function replayWebGlGlesTextureImage(gl, state, operation) {
	if (operation?.kind === "pixel-store") return handled(pixelStore(gl, operation));
	if (operation?.kind === "tex-image-2d") return handled(texImage2d(gl, state, operation));
	if (operation?.kind === "copy-tex-image-2d") return handled(copyImage2d(gl, state, operation, false));
	if (operation?.kind === "copy-tex-sub-image-2d") return handled(copyImage2d(gl, state, operation, true));
	return Object.freeze({ applied: false, handled: false });
}

function pixelStore(gl, operation) {
	gl.pixelStorei(Number(operation.pname), Number(operation.param));
	return true;
}

function texImage2d(gl, state, operation) {
	const texture = resolveWebGlGlesTexture(gl, state, operation.texture, operation.bindingTarget);
	if (!texture) return false;
	const pixels = createWebGlGlesPixelData(operation.pixels, operation.type);
	if (operation.pixels !== null && pixels === undefined) return false;
	gl.bindTexture(Number(operation.bindingTarget), texture);
	gl.texImage2D(
		Number(operation.target),
		Number(operation.level),
		Number(operation.internalFormat),
		Number(operation.width),
		Number(operation.height),
		Number(operation.border),
		Number(operation.format),
		Number(operation.type),
		pixels
	);
	return true;
}

/** Replays framebuffer-to-texture copies against the exact guest-bound texture. */
function copyImage2d(gl, state, operation, subImage) {
	const texture = resolveWebGlGlesTexture(gl, state, operation.texture, operation.bindingTarget);
	if (!texture) return false;
	gl.bindTexture(Number(operation.bindingTarget), texture);
	if (subImage) {
		gl.copyTexSubImage2D(Number(operation.target), Number(operation.level), Number(operation.xoffset), Number(operation.yoffset), Number(operation.x), Number(operation.y), Number(operation.width), Number(operation.height));
	} else {
		gl.copyTexImage2D(Number(operation.target), Number(operation.level), Number(operation.internalFormat), Number(operation.x), Number(operation.y), Number(operation.width), Number(operation.height), Number(operation.border));
	}
	return true;
}

function handled(applied) {
	return Object.freeze({ applied: Boolean(applied), handled: true });
}
