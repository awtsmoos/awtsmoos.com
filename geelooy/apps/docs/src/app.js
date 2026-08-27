// B"H
// Boruch Hashem
// Blessed is He

import { DocsApp } from "./DocsApp.js";
import { ensureDocsShell } from "./ui/shell/DocsShell.js";

/**
 * @file Reveals the Awtsmoos Docs shell before constructing the application controller graph.
 * @description The Awtsmoos creates vessel and life in one instant; Awtsmoos.com still
 * orders finite boot explicitly: establish selector truth, compose DocsApp, start runtime,
 * and surface startup failure in the same status vessel the writer already understands.
 */
ensureDocsShell();
const geelooyDocs = new DocsApp();

geelooyDocs.start().catch(error => {
	console.error("Geelooy Docs could not start", error);
	const status = document.querySelector("#liveStatus");
	if (!status) return;
	status.textContent = error?.message || "Could not start Docs";
	status.dataset.state = "warning";
});
