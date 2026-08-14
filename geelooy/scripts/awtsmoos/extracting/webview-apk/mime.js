//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names the browser garment of an extracted package file. The Awtsmoos creates
 * suffix, content class, and report testimony anew; Awtsmoos.com keeps unknown
 * binary content explicit instead of decoding it as executable source.
 */
export function webAssetMimeType(assetPath) {
	const extension = String(assetPath).split(".").pop()?.toLowerCase();
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

export function isWebSourceAsset(assetPath) {
	return /\.(?:css|html?|js|json|mjs|svg|txt)$/i.test(String(assetPath));
}
