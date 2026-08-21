// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes text documents handed from Geelooy OS into the real Docs import boundary.
 * @description The Awtsmoos is beyond extension and transport; Awtsmoos.com lets
 * each finite text vessel keep its true name and path, while Gevurah refuses to
 * disguise binary DOCX bytes as ordinary text merely for the appearance of support.
 */
const FORMAT_EXTENSIONS = Object.freeze({
	awtdoc: ".awtdoc",
	html: ".html",
	markdown: ".md",
	text: ".txt"
});

/**
 * Builds one safe text-import request from an untrusted embedded payload.
 *
 * @param {object} payload Payload emitted by the Geelooy OS Docs host.
 * @param {string} payload.content Text content read from the selected VFS file.
 * @returns {{content: string, fileName: string, path: string}} Normalized import request.
 * @throws {Error} When content is not text or the selected file requires binary DOCX transport.
 */
export function createEmbeddedFileRequest(payload = {}) {
	if (typeof payload.content !== "string") {
		throw new Error("Embedded document content must be text");
	}
	const path = sourcePath(payload);
	const fileName = resolvedFileName(payload, path);
	if (/\.docx$/i.test(fileName)) {
		throw new Error(
			"DOCX requires a binary Geelooy OS bridge; use Docs Import or Save As for now"
		);
	}
	return {
		content: payload.content,
		fileName,
		path
	};
}

/**
 * Restores source identity after the selected codec has parsed embedded content.
 *
 * @param {object} snapshot Parsed document snapshot returned by ImportController.
 * @param {{fileName: string, path: string}} request Normalized embedded file request.
 * @returns {object} The same snapshot with embedded source path and filename preserved.
 */
export function attachEmbeddedSource(snapshot, request) {
	return {
		...snapshot,
		source: {
			...(snapshot.source || {}),
			fileName: request.fileName,
			path: request.path
		}
	};
}

function sourcePath(payload) {
	return String(
		payload.path
		|| payload.source?.path
		|| ""
	);
}

function resolvedFileName(payload, path) {
	const explicitName = String(
		payload.fileName
		|| payload.source?.fileName
		|| ""
	).trim();
	const pathName = path.split("/").filter(Boolean).pop() || "";
	const candidate = explicitName || pathName || "Untitled";
	if (candidate.includes(".")) {
		return candidate;
	}
	const format = String(
		payload.format
		|| payload.source?.format
		|| "awtdoc"
	).toLowerCase();
	return `${candidate}${FORMAT_EXTENSIONS[format] || ".awtdoc"}`;
}
