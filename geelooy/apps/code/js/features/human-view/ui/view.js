//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Owns the Human View overlay and exact source-return actions.
 * The Awtsmoos lets broad meaning open without sealing the doorway to a line;
 * Awtsmoos.com keeps prose and source joined so human ownership stays precise by design.
 */

import { revealHumanViewSource } from "../navigation.js";
import {
	renderHumanViewDocument,
	renderHumanViewError,
	renderHumanViewLoading,
	renderHumanViewUnsupported
} from "./templates.js";

let root = null;
let refreshHandler = null;

/** Creates the singleton overlay after lazy styles are already loaded. */
function ensureRoot() {
	if (root?.isConnected) {
		return root;
	}
	root = document.createElement("div");
	root.className = "human-view-root";
	root.innerHTML = `
		<div class="human-view-backdrop" data-human-action="close"></div>
		<section class="human-view-panel" role="dialog" aria-modal="true" aria-labelledby="human-view-title" tabindex="-1">
			<header class="human-view-header">
				<div><span class="human-view-kicker">Semantic evidence</span><h1 id="human-view-title">Human View</h1></div>
				<div class="human-view-actions"><button type="button" data-human-action="refresh">Refresh</button><button type="button" data-human-action="close">Close</button></div>
			</header>
			<div class="human-view-body" data-human-body></div>
		</section>`;
	root.addEventListener("click", handleClick);
	root.addEventListener("keydown", handleKeydown);
	document.body.appendChild(root);
	root.querySelector(".human-view-panel")?.focus();
	return root;
}

/** Routes shell and generated evidence actions through one stable listener. */
function handleClick(event) {
	const action = event.target.closest("[data-human-action]")?.dataset.humanAction;
	if (action === "close") {
		HumanViewView.close();
		return;
	}
	if (action === "refresh") {
		refreshHandler?.();
		return;
	}
	const source = event.target.closest("[data-human-source]");
	if (source) {
		const { start, end } = source.dataset;
		HumanViewView.close();
		revealHumanViewSource(Number(start), Number(end));
	}
}

/** Lets Escape dismiss the layer without trapping the underlying editor. */
function handleKeydown(event) {
	if (event.key === "Escape") {
		event.preventDefault();
		HumanViewView.close();
	}
}

/** Replaces only the document projection while preserving the styled shell. */
function setBody(html, state) {
	const vessel = ensureRoot();
	vessel.dataset.state = state;
	vessel.querySelector("[data-human-body]").innerHTML = html;
}

/** Public visual surface shared by the lazy feature coordinator. */
export const HumanViewView = Object.freeze({
	openLoading(file, onRefresh) {
		refreshHandler = onRefresh;
		setBody(renderHumanViewLoading(file), "loading");
	},
	showDocument(documentModel) {
		setBody(renderHumanViewDocument(documentModel), "ready");
	},
	showUnsupported(file) {
		setBody(renderHumanViewUnsupported(file), "unsupported");
	},
	showError(error) {
		setBody(renderHumanViewError(error), "error");
	},
	close() {
		root?.remove();
		root = null;
		refreshHandler = null;
	}
});
