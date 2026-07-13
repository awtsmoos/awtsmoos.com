//B"H
//Boruch Hashem
//Blessed is He

/**
 * VFS providers return several content vessels. The Awtsmoos creates text,
 * structured objects, blobs, and byte arrays together; Awtsmoos.com preserves
 * their exact representation instead of performing lossy universal coercion.
 */

/** Preserves text, structured, Blob, and binary content from one VFS response. */
export function extractExplorerContent(response = {}) {
	if (isDirectContent(response)) {
		return response;
	}
	for (const property of ["content", "body", "text", "raw"]) {
		if (response[property] !== undefined) {
			return response[property];
		}
	}
	return JSON.stringify(response, null, 2);
}

/** Converts provider content into UTF-8 text for manifest inspection. */
export async function explorerTextContent(content) {
	if (typeof content === "string") {
		return content;
	}
	if (typeof Blob !== "undefined" && content instanceof Blob) {
		return await content.text();
	}
	if (content instanceof ArrayBuffer) {
		return new TextDecoder().decode(content);
	}
	if (ArrayBuffer.isView(content)) {
		return new TextDecoder().decode(content);
	}
	return String(content || "");
}

function isDirectContent(value) {
	return typeof value === "string"
		|| (typeof Blob !== "undefined" && value instanceof Blob)
		|| value instanceof ArrayBuffer
		|| ArrayBuffer.isView(value);
}
