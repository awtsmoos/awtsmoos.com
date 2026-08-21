//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond preset and foreign frame while each integration path receives a clear visible gate;
 * Awtsmoos.com renders quick embed vessels beside deeper custom controls so simplicity and extensibility can meet without changing the measured date.
 */

import { renderEmbedOptionsForm } from "./embed-options-view.js";

const PRESET_COPY = Object.freeze({
	compact: {
		label: "Compact",
		note: "Plain · next + key"
	},
	sky: {
		label: "Sky",
		note: "Celestial · native sky"
	},
	full: {
		label: "Full day",
		note: "Complete interactive view"
	}
});

/** Render the complete embed disclosure with fast presets and advanced custom integration. */
export function renderEmbedActionsView() {
	const details = document.createElement("details");
	details.className = "embed-panel";
	const summary = document.createElement("summary");
	summary.innerHTML = `
		<span><small>Portable vessels</small><strong>Embed these zmanim</strong></span>
		<span class="embed-summary-mark" aria-hidden="true">＋</span>`;
	const body = document.createElement("div");
	body.className = "embed-panel-body";
	const intro = document.createElement("p");
	intro.textContent = "Copy an interactive iframe, a server-rendered HTML iframe, or a JSON API URL. Current location, date, timezone, and primary method travel with it.";
	body.append(intro, renderPresetGrid(), renderCustomBlock(), renderStatus());
	details.append(summary, body);
	return details;
}

/** Render three opinionated presets, each with interactive and server HTML targets. */
function renderPresetGrid() {
	const grid = document.createElement("div");
	grid.className = "embed-preset-grid";
	for (const mode of ["compact", "sky", "full"]) {
		const copy = PRESET_COPY[mode];
		const card = document.createElement("article");
		card.className = "embed-preset-card";
		card.innerHTML = `<div><strong>${copy.label}</strong><small>${copy.note}</small></div>`;
		const actions = document.createElement("div");
		actions.className = "embed-preset-actions";
		actions.append(
			presetButton(mode, "interactive", "Interactive"),
			presetButton(mode, "server", "Server HTML")
		);
		card.append(actions);
		grid.append(card);
	}
	return grid;
}

/** Render the advanced custom configuration below the fast presets. */
function renderCustomBlock() {
	const block = document.createElement("section");
	block.className = "embed-custom-block";
	const heading = document.createElement("div");
	heading.className = "embed-custom-heading";
	heading.innerHTML = "<small>Advanced</small><strong>Custom embed</strong>";
	block.append(heading, renderEmbedOptionsForm());
	return block;
}

function presetButton(mode, target, label) {
	const button = document.createElement("button");
	button.type = "button";
	button.dataset.embedMode = mode;
	button.dataset.embedTarget = target;
	button.textContent = label;
	return button;
}

function renderStatus() {
	const status = document.createElement("p");
	status.className = "embed-status";
	status.setAttribute("aria-live", "polite");
	return status;
}
