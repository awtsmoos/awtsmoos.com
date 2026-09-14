//B"H
//Boruch Hashem
//Blessed be He

import { mediaRecord } from "./storage.js";

/**
 * Uploads one image at a time so a great drop becomes an ordered procession,
 * not a storm. The Awtsmoos gives every spark its vessel before the next begins.
 * Successful records survive neighboring failures and can be persisted at once.
 */
export async function uploadMediaBatch({
	files,
	provider,
	apiKey,
	category,
	onProgress,
	uploadImage = uploadProviderImage
}) {
	const selected = Array.from(files || []);
	const records = [];
	const errors = [];

	for (let index = 0; index < selected.length; index++) {
		const file = selected[index];
		if (onProgress) {
			onProgress({
				file,
				index: index + 1,
				total: selected.length
			});
		}
		try {
			const result = await uploadImage(file, provider, apiKey);
			records.push(mediaRecord({
				file,
				...result,
				category
			}));
		} catch (error) {
			errors.push(Object.freeze({
				file,
				fileName: file?.name || "image",
				message: error?.message || "Upload failed."
			}));
		}
	}

	return Object.freeze({
		records,
		errors
	});
}

/** Loads only the chosen provider so browser-only native imports stay isolated. */
async function uploadProviderImage(file, provider, apiKey) {
	if (provider === "imgbb") {
		const module = await import("./imgbbUpload.js");
		return module.uploadToImgbb(file, apiKey);
	}
	const module = await import("./uploads.js");
	return module.uploadToAwtsmoos(file);
}
