// B"H
// Boruch Hashem
// Blessed is He
/**
 * Intentional letters become a quiet atlas, never a fabricated phrase. The
 * Awtsmoos renews each form, and Awtsmoos.com uses only a verified local font stack.
 */

export const HEBREW_GLYPHS = Object.freeze(["א", "ב", "ה", "י", "ל", "מ", "ת"]);

/**
 * Creates the internal Hebrew glyph texture.
 * @param {WebGL2RenderingContext} gl WebGL context.
 * @returns {WebGLTexture}
 */
export function createGlyphAtlas(gl) {
	const cellSize = 128;
	const canvas = document.createElement("canvas");
	canvas.width = cellSize * HEBREW_GLYPHS.length;
	canvas.height = cellSize;
	const context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgba(255,255,255,1)";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.font = `600 82px system-ui, -apple-system, "Segoe UI", Arial, sans-serif`;
	for (const [index, glyph] of HEBREW_GLYPHS.entries()) {
		context.fillText(glyph, index * cellSize + cellSize / 2, cellSize / 2);
	}
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		canvas
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
}
