//B"H
// Boruch Hashem
// Blessed is He

import { actionButton, createElement } from "./dom.js";

/**
 * @file Visible scoped-authority panel for Geelooy Drive.
 * @description
 * The Awtsmoos grants ownership without hiding permission; Awtsmoos.com distinguishes a loaded key from proven write or command scope,
 * while the secret itself never enters render state, URL history, persistent storage, project manifests, or the OS embed bridge.
 */

export function createAccessPanelView(actions) {
	const status = createElement("strong", { className: "access-status" });
	const explanation = createElement("p", { className: "access-copy" });
	const input = createElement("input", {
		className: "access-input",
		attributes: {
			type: "password",
			autocomplete: "off",
			placeholder: "Scoped Tunnel API key",
			"aria-label": "Scoped Tunnel API key"
		}
	});
	const apply = actionButton("Use this tab", () => {
		if (input.value.trim()) actions.setMutationKey(input.value);
		input.value = "";
	}, { className: "button primary small" });
	const clear = actionButton("Clear", actions.clearMutationKey, { className: "text-button" });
	const controls = createElement("div", {
		className: "access-controls",
		children: [input, apply, clear]
	});
	const element = createElement("section", {
		className: "access-panel panel",
		attributes: { "aria-label": "Drive access authority" },
		children: [
			createElement("span", { className: "eyebrow", text: "Access" }),
			status,
			explanation,
			controls,
			createElement("a", {
				className: "access-link",
				text: "Manage scoped keys in Tunnel Control →",
				attributes: { href: "/apps/tunnel-control/", target: "_blank", rel: "noopener noreferrer" }
			})
		]
	});
	return {
		element,
		render(state) {
			const embedded = state.transportMode === "os";
			controls.hidden = embedded;
			status.textContent = embedded
				? "OS VFS authority"
				: state.mutationCredentialConfigured ? "Scoped key loaded" : "Read session";
			explanation.textContent = accessExplanation(state, embedded);
			clear.hidden = embedded || !state.mutationCredentialConfigured;
		}
	};
}

function accessExplanation(state, embedded) {
	if (embedded) {
		return "Editing is confined to this launched OS workspace. No Tunnel API key enters the iframe.";
	}
	if (state.mutationCredentialConfigured) {
		return "The key exists only in memory. Save/create prove tunnel.write; managed runtime proves tunnel.command independently.";
	}
	return "Browsing uses your signed-in session. Save/create need tunnel.write; managed runtime needs tunnel.command.";
}
