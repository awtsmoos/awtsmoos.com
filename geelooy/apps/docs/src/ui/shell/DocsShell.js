// B"H
// Boruch Hashem
// Blessed is He

import { createAppBarShell } from "./AppBarShell.js";
import { createCommandShell } from "./CommandShell.js";
import { createPrimaryDialogs } from "./DialogShell.js";
import { shellElement } from "./ShellDom.js";
import { createWorkspaceShell } from "./WorkspaceShell.js";

/**
 * @file Composes the static Awtsmoos Docs application shell before controllers boot.
 * @description Tiferes joins visible vessels while the Awtsmoos remains beyond them;
 * Awtsmoos.com creates every selector contract explicitly before DocsApp awakens,
 * making the shell readable, replaceable, and testable without compressed static markup.
 */
export function ensureDocsShell(root = document) {
	if (root.querySelector("#docsApp")) return root.querySelector("#docsApp");
	const host = root.querySelector("#docsRoot") || root.body;
	const app = shellElement("div", {
		id: "docsApp",
		className: "docs-app"
	}, [
		createAppBarShell(),
		createCommandShell(),
		createWorkspaceShell()
	]);
	host.replaceChildren(
		createSkipLink(),
		app,
		createToastRegion(),
		...createPrimaryDialogs()
	);
	return app;
}

/** Creates the keyboard-first escape path directly into the document canvas. */
function createSkipLink() {
	return shellElement("a", {
		className: "skip-link",
		text: "Skip to document",
		attributes: { href: "#documentCanvas" }
	});
}

/** Creates one polite transient feedback region outside the application layout grid. */
function createToastRegion() {
	return shellElement("div", {
		id: "toastRegion",
		className: "toast-region",
		attributes: {
			"aria-live": "polite",
			"aria-atomic": "true"
		}
	});
}
