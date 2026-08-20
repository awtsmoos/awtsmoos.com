//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded-mode revelation for Geelooy Drive.
 * @description
 * The Awtsmoos creates desktop and iframe together while Awtsmoos.com refuses to infer trust from mere nesting;
 * only explicit channel, parent origin, and OS embed markers awaken the confined VFS transport within.
 */

export function readDriveEmbedContext(locationLike = globalThis.location) {
	const search = String(locationLike?.search || "");
	const parameters = new URLSearchParams(search);
	const channelId = String(parameters.get("embedChannel") || "");
	const parentOrigin = validParentOrigin(
		parameters.get("embedParentOrigin"),
		locationLike?.origin
	);
	const embedded = parameters.get("embed") === "awtsmoos-os"
		&& parameters.get("embedParent") === "geelooy-os"
		&& Boolean(channelId && parentOrigin);
	return Object.freeze({
		embedded,
		mode: embedded ? "os" : "standalone",
		channelId: embedded ? channelId : "",
		parentOrigin: embedded ? parentOrigin : ""
	});
}

export function applyDriveDocumentMode(context, documentLike = globalThis.document) {
	if (!documentLike?.documentElement) return;
	documentLike.documentElement.dataset.driveMode = context?.mode || "standalone";
}

function validParentOrigin(value, ownOrigin) {
	if (!value || !ownOrigin) return "";
	try {
		const origin = new URL(String(value)).origin;
		return origin === ownOrigin ? origin : "";
	} catch {
		return "";
	}
}
