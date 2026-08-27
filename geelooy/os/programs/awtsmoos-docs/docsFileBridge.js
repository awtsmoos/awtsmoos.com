// B"H
// Boruch Hashem
// Blessed is He

import { createEmbedEndpoint } from "../../../shared/embed/endpoint.js";
import {
	authorizedDocsPath,
	embeddedDocsPrincipal,
	initialDocsPayload,
	reportRejectedDocsMessage,
	requiredDocsTargetWindow
} from "./docsBridgePolicy.js";

/**
 * @file Grants embedded Awtsmoos Docs exactly one selected text-file capability.
 * @description The Awtsmoos is beyond filesystem and iframe; Awtsmoos.com reveals
 * one narrow artery where a chosen document may enter and return, while Gevurah
 * refuses directory powers, path substitution, or unrelated filesystem commands.
 */
export function createDocsFileBridge(options = {}) {
	const selectedPath = authorizedDocsPath(options.initialFile);
	const endpoint = createEmbedEndpoint({
		localId: "geelooy-os",
		remoteId: "geelooy-docs",
		channelId: options.channelId,
		targetWindow: requiredDocsTargetWindow(options.iframe),
		targetOrigin: options.targetOrigin,
		listenWindow: options.listenWindow || globalThis.window,
		onRejected: options.onRejected || reportRejectedDocsMessage
	});
	const principal = embeddedDocsPrincipal(options.channelId);
	endpoint.onEvent("docs-ready", () => {
		endpoint.sendEvent(
			"initial-content",
			initialDocsPayload(options.initialFile, selectedPath)
		);
	});
	endpoint.onEvent("save-request", payload => {
		void saveSelectedDocument({
			endpoint,
			os: options.os,
			principal,
			selectedPath,
			payload,
			onError: options.onError
		});
	});
	return () => endpoint.stop();
}

/** Writes only to the path granted when the OS launched this Docs window. */
async function saveSelectedDocument(context) {
	try {
		if (typeof context.payload?.content !== "string") {
			throw new Error("Embedded document save content must be text");
		}
		await context.os.vfs.write(
			context.selectedPath,
			context.payload.content,
			context.principal
		);
		context.endpoint.sendEvent("save-result", {
			ok: true,
			path: context.selectedPath
		});
	} catch (error) {
		context.endpoint.sendEvent("save-result", {
			ok: false,
			path: context.selectedPath,
			message: error?.message || "Geelooy OS could not save this document"
		});
		context.onError?.(error);
	}
}
