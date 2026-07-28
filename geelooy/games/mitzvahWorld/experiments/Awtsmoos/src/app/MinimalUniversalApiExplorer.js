// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import {
	RuntimeAdapter,
	createUniversalAwtsmoosApi,
	mountApiExplorer
} from "/libs/awtsmoos-procedural-core/src/core/universalApi/index.js";

class MitzvahWorldEventAdapter extends RuntimeAdapter {
	async commit(stage) {
		window.dispatchEvent(new CustomEvent("awtsmoos:universal-transaction", {
			detail: JSON.parse(JSON.stringify({
				method: stage.command.method,
				changes: stage.changes,
				revision: stage.after.revision
			}))
		}));
	}
}

const api = createUniversalAwtsmoosApi({
	runtimeAdapter: new MitzvahWorldEventAdapter()
});
const globalAwtsmoos = window.Awtsmoos ??= {};
globalAwtsmoos.universal = api;
for (const namespace of ["api", "core", "humans", "trees", "houses", "water", "textures"]) {
	globalAwtsmoos[namespace] ??= api[namespace];
}

const toggle = document.createElement("button");
toggle.id = "universalApiToggle";
toggle.type = "button";
toggle.textContent = "API";
toggle.setAttribute("aria-controls", "universalApiExplorer");
toggle.setAttribute("aria-expanded", "false");

const panel = document.createElement("aside");
panel.id = "universalApiExplorer";
panel.hidden = true;
panel.setAttribute("aria-label", "Awtsmoos Universal API Explorer");
document.body.append(toggle, panel);
mountApiExplorer({ target: panel, api });

toggle.addEventListener("click", () => {
	panel.hidden = !panel.hidden;
	toggle.setAttribute("aria-expanded", String(!panel.hidden));
});

export { api as universalMitzvahWorldApi };
