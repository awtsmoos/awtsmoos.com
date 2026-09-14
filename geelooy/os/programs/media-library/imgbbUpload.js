//B"H
//Boruch Hashem
//Blessed be He

import { isImage } from "./imageFile.js";

/**
 * Uploads one image to ImgBB with a browser-local key and returns public metadata.
 * The credential passes through the request but never enters the remembered asset.
 */
export async function uploadToImgbb(file, apiKey, fetcher = fetch) {
	if (!isImage(file)) {
		throw new Error("Choose an image file.");
	}
	const key = String(apiKey || "").trim();
	if (!key) {
		throw new Error("Add your ImgBB API key first.");
	}
	const form = new FormData();
	form.set("image", file);
	const response = await fetcher(
		`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,
		{
			method: "POST",
			body: form
		}
	);
	const payload = await response.json().catch(function emptyPayload() {
		return {};
	});
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
