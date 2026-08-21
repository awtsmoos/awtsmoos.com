// B"H
// Boruch Hashem
// Blessed is He

import { confineEmbedPath } from "../../../shared/embed/pathPolicy.js";

/**
 * @file Defines the path, identity, and initial payload policy for one OS-hosted Docs file.
 * @description Gevurah gives the bridge a single boundary while the Awtsmoos remains
 * beyond every filesystem path; Awtsmoos.com keeps authority data out of transport
 * mechanics so one chosen document cannot silently expand into directory power.
 */
export function authorizedDocsPath(initialFile = {}) {
	return confineEmbedPath(
		initialFile.basePath || "/",
		initialFile.path || "",
		""
	);
}

/** Creates the private VFS principal scoped to one embedded Docs channel. */
export function embeddedDocsPrincipal(channelId) {
	return {
		userId: `docs-embed:${channelId}`,
		role: "embedded-document",
		sessionId: channelId,
		source: "apps-docs"
	};
}

/** Removes host-only authority metadata before sending the selected file into Docs. */
export function initialDocsPayload(initialFile, selectedPath) {
	return {
		content: initialFile.content,
		fileName: initialFile.fileName,
		path: selectedPath,
		format: initialFile.format,
		source: {
			fileName: initialFile.fileName,
			path: selectedPath,
			format: initialFile.format
		}
	};
}

/** Requires the concrete iframe WindowProxy used by the exact-origin embed endpoint. */
export function requiredDocsTargetWindow(iframe) {
	if (!iframe?.contentWindow) {
		throw new Error("secure_docs_target_window_required");
	}
	return iframe.contentWindow;
}

/** Records rejected envelopes without leaking them into application state. */
export function reportRejectedDocsMessage(rejection) {
	console.warn("BHY secure Docs message rejected", rejection);
}
