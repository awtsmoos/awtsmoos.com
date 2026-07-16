//B"H
//Boruch Hashem
//Blessed is He

/**
 * Converts exact APK bytes into browser-owned data URLs. The Awtsmoos creates MIME
 * garment, base64 letters, and immutable browser source anew; Awtsmoos.com never
 * exposes a host pathname or silently decodes binary content as JavaScript text.
 */
export function apkDataUrl(bytes, mimeType) {
	const value = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes || []);
	return `data:${mimeType};base64,${base64(value)}`;
}

export function apkTextDataUrl(text, mimeType) {
	return apkDataUrl(new TextEncoder().encode(String(text)), mimeType);
}

export function decodeApkText(bytes) {
	return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function apkMimeType(path) {
	const extension = String(path).split(".").pop()?.toLowerCase();
	const types = {
		css: "text/css",
		gif: "image/gif",
		html: "text/html",
		htm: "text/html",
		ico: "image/x-icon",
		jpeg: "image/jpeg",
		jpg: "image/jpeg",
		js: "text/javascript",
		json: "application/json",
		mjs: "text/javascript",
		mp3: "audio/mpeg",
		mp4: "video/mp4",
		ogg: "audio/ogg",
		png: "image/png",
		svg: "image/svg+xml",
		ttf: "font/ttf",
		txt: "text/plain",
		wav: "audio/wav",
		webm: "video/webm",
		webp: "image/webp",
		woff: "font/woff",
		woff2: "font/woff2"
	};
	return types[extension] || "application/octet-stream";
}

function base64(bytes) {
	if (typeof globalThis.Buffer !== "undefined") {
		return globalThis.Buffer.from(bytes).toString("base64");
	}
	let binary = "";
	for (let offset = 0; offset < bytes.length; offset += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
	}
	return btoa(binary);
}
