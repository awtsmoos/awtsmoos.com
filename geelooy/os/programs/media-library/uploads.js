//B"H
//Boruch Hashem
//Blessed be He

import { publishLocalFile } from "../../session/localFileAccess.js";
import { isImage, safeFileName } from "./imageFile.js";
export { uploadToImgbb } from "./imgbbUpload.js";
export { isImage, safeFileName } from "./imageFile.js";

/**
 * Uploads one image through the current Awtsmoos alias filesystem and returns
 * the canonical permanent public URL. Alias identity is resolved by Geelooy OS.
 */
export async function uploadToAwtsmoos(file) {
	if (!isImage(file)) {
		throw new Error("Choose an image file.");
	}
	const safeName = safeFileName(file.name);
	const result = await publishLocalFile({
		path: "assets/images",
		fileName: safeName,
		content: file
	});
	if (result?.mode !== "published" || !result.url) {
		throw new Error(
			"Sign in to Awtsmoos so the current alias can publish this image."
		);
	}
	return Object.freeze({
		url: result.url,
		provider: "awtsmoos",
		alias: result.alias,
		path: result.path
	});
}
