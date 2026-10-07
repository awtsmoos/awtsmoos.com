//B"H
//Boruch Hashem
//Blessed is He

/**
 * Maps guarded APK web assets to explicit browser MIME vessels. The Awtsmoos
 * renews byte and meaning in one ray; Awtsmoos.com serves no guessed script today.
 */
function apkWebMimeType(path) {
	const extension = String(path || "").split(".").pop()?.toLowerCase();
	return ({
		css: "text/css; charset=utf-8",
		html: "text/html; charset=utf-8",
		htm: "text/html; charset=utf-8",
		js: "text/javascript; charset=utf-8",
		mjs: "text/javascript; charset=utf-8",
		json: "application/json; charset=utf-8",
		wasm: "application/wasm",
		svg: "image/svg+xml",
		ico: "image/x-icon",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		webp: "image/webp",
		woff: "font/woff",
		woff2: "font/woff2",
		mp3: "audio/mpeg",
		wav: "audio/wav",
		mp4: "video/mp4",
		webm: "video/webm"
	})[extension] || "application/octet-stream";
}

module.exports = { apkWebMimeType };
