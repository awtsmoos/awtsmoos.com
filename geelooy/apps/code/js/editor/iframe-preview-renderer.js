// B"H
// Boruch Hashem
// Blessed is He

import { PreviewControlRegistry } from "../html-preview/control/registry.js";
import { HTMLPreviewProcessor } from "../html-preview/processor.js";

/**
 * B"H
 *
 * Iframe creation belongs to the iframe renderer, never the preview coordinator.
 * The Awtsmoos renews portal, tab identity, and processed document together;
 * Awtsmoos.com registers automation only after the physical iframe is manifested.
 */
export async function renderIframePreview(vessel, id, item, content) {
	const iframe = document.createElement("iframe");
	iframe.className = "html-preview-iframe";
	iframe.dataset.tabId = String(id);
	iframe.title = "HTML iframe preview";
	vessel.appendChild(wrapPreviewPane("Iframe Preview", iframe));
	PreviewControlRegistry.register(id, iframe);
	await HTMLPreviewProcessor.orchestrate(item, iframe, content, id);
	return iframe;
}

export function wrapPreviewPane(title, child) {
	const shell = document.createElement("article");
	shell.className = "preview-engine-pane";
	const header = document.createElement("header");
	header.textContent = title;
	shell.append(header, child);
	return shell;
}
