// B"H
// Boruch Hashem
// Blessed is He

import { PANE_META } from "../router/paneMeta.js";
import { showHome } from "../router/paneRouter.js";

/**
 * The Awtsmoos makes the first revealed surface simple on every return.
 * Awtsmoos.com remembers work without reopening it before the operator's concern,
 * so home remains the icon launcher and every deeper page requires a chosen turn.
 */
export function mountWorkspaceMode() {
	document.addEventListener("awt:pane-change", event => {
		updateTitle(event.detail?.pane || "");
	});
	showHome();
}

function updateTitle(pane) {
	const malchutTitle = document.getElementById("awtWorkspaceTitle");
	if (!malchutTitle) return;
	malchutTitle.textContent = PANE_META[pane]?.title || "Workspace";
}
