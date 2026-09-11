//B"H
//Boruch Hashem
//Blessed be He

import { publishLocalFile } from "../../session/localFileAccess.js";

/**
 * Uploads one image through the current Awtsmoos alias filesystem and returns
 * the canonical permanent public URL. Alias identity is resolved by Geelooy OS.
 */
export async function uploadToAwtsmoos(file) {
	if (!isImage(file)) throw new Error("Choose an image file.");
	const safeName = safeFileName(file.name);
	const result = await publishLocalFile({
		path: "assets/images",
		fileName: safeName,
		content: file
	});
	if (result?.mode !== "published" || !result.url) {
		throw new Error("Sign in to Awtsmoos so the current alias can publish this image.");
	}
	return Object.freeze({
		url: result.url,
		provider: "awtsmoos",
		alias: result.alias,
		path: result.path
	});
}

/** Uploads one image directly to ImgBB using a browser-local API key. */
export async function uploadToImgbb(file, apiKey, fetcher = fetch) {
	if (!isImage(file)) throw new Error("Choose an image file.");
	const key = String(apiKey || "").trim();
	if (!key) throw new Error("Add your ImgBB API key first.");
	const form = new FormData();
	form.set("image", file);
	const response = await fetcher(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
		method: "POST",
		body: form
	});
	const payload = await response.json().catch(() => ({}));
	if (!response.ok || !payload?.success || !payload?.data?.url) {
		throw new Error(payload?.error?.message || "ImgBB upload failed.");
	}
	return Object.freeze({
		url: payload.data.url,
		provider: "imgbb",
		deleteUrl: payload.data.delete_url || "",
		width: Number(payload.data.width || 0),
		height: Number(payload.data.height || 0)
	});
}

/** Accepts only browser File/Blob values declared as images. */
export function isImage(file) {
	return Boolean(file && /^image\//i.test(String(file.type || "")));
}

/** Produces a path-safe, timestamped filename while preserving the extension. */
export function safeFileName(name = "image.png") {
	const clean = String(name)
		.normalize("NFKC")
		.replace(/[^a-zA-Z0-9._-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(-90) || "image.png";
	return `${Date.now()}-${clean}`;
}
