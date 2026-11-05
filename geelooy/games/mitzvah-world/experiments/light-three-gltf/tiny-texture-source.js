// B"H
export function sourceReady(source) {
	return !!(
		source
		&& sourceWidth(source)
		&& sourceHeight(source)
		&& source.complete !== false
	);
}

export function sourceWidth(source) {
	return source?.naturalWidth || source?.videoWidth || source?.width || 0;
}

export function sourceHeight(source) {
	return source?.naturalHeight || source?.videoHeight || source?.height || 0;
}

export function createDefaultTexture(gl) {
	const texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([255, 255, 255, 255])
	);
	setTextureParameters(gl, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE);
	return texture;
}

export function setTextureParameters(gl, minification, magnification, wrap) {
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minification);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magnification);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
}

export function isPowerOfTwo(value) {
	return value > 0 && (value & (value - 1)) === 0;
}
