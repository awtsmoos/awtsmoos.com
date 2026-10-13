//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChossidWardrobeUI.js
 * @description Embeddable "dress your chossid" panel for any Awtsmoos game.
 * Changes save to the shared wardrobe and broadcast to every open game.
 *
 * Usage:
 *   import { createWardrobePanel, openWardrobeDialog } from '/games/scripts/wardrobe/ChossidWardrobeUI.js';
 *   document.body.appendChild(createWardrobePanel());
 *   // or
 *   openWardrobeDialog();
 */

import {
	loadWardrobe,
	saveWardrobe,
	resetWardrobe,
	subscribeWardrobe,
	WARDROBE_PALETTES,
	HAT_STYLES
} from "./ChossidWardrobe.js";

const COLOR_SECTIONS = [
	{ key: "jacket", label: "Coat", palette: WARDROBE_PALETTES.coat },
	{ key: "pants", label: "Pants", palette: WARDROBE_PALETTES.pants },
	{ key: "shirt", label: "Shirt", palette: WARDROBE_PALETTES.shirt },
	{ key: "shoes", label: "Shoes", palette: WARDROBE_PALETTES.shoes },
	{ key: "skin", label: "Skin", palette: WARDROBE_PALETTES.skin },
	{ key: "hair", label: "Beard & Hair", palette: WARDROBE_PALETTES.hair },
	{ key: "eyes", label: "Eyes", palette: WARDROBE_PALETTES.eyes }
];

const HAT_COLOR_SECTIONS = [
	{ key: "tophat", label: "Hat color", palette: WARDROBE_PALETTES.hat },
	{ key: "yamulka", label: "Yarmulka color", palette: WARDROBE_PALETTES.hat }
];

const TOGGLE_SECTIONS = [
	{ key: "glasses", label: "Glasses" },
	{ key: "beard", label: "Beard" },
	{ key: "tzitzis", label: "Tzitzis" },
	{ key: "tefillin", label: "Tefillin" }
];

function el(tag, className, text) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

function swatchButton(hex, selected, onPick) {
	const btn = el("button", "aw-wardrobe-swatch" + (selected ? " aw-wardrobe-swatch--selected" : ""));
	btn.type = "button";
	btn.style.setProperty("--swatch-color", hex);
	btn.setAttribute("aria-label", "Choose color " + hex);
	btn.title = hex;
	btn.addEventListener("click", () => onPick(hex));
	return btn;
}

function colorRow(section, cfg, refresh) {
	const wrap = el("div", "aw-wardrobe-row");
	const label = el("span", "aw-wardrobe-row-label", section.label);
	wrap.appendChild(label);
	const swatches = el("div", "aw-wardrobe-swatches");
	const current = cfg.colors[section.key];
	for (const hex of section.palette) {
		swatches.appendChild(swatchButton(hex, hex.toLowerCase() === String(current).toLowerCase(), (picked) => {
			saveWardrobe({ colors: { [section.key]: picked } });
			refresh();
		}));
	}
	// Custom color picker for any color at all.
	const custom = el("input", "aw-wardrobe-custom");
	custom.type = "color";
	custom.value = current || "#1b1b22";
	custom.title = "Custom color";
	custom.setAttribute("aria-label", section.label + " custom color");
	custom.addEventListener("input", () => {
		saveWardrobe({ colors: { [section.key]: custom.value } });
		refresh();
	});
	swatches.appendChild(custom);
	wrap.appendChild(swatches);
	return wrap;
}

function hatRow(cfg, refresh) {
	const wrap = el("div", "aw-wardrobe-row");
	wrap.appendChild(el("span", "aw-wardrobe-row-label", "Headwear"));
	const choices = el("div", "aw-wardrobe-choices");
	for (const style of HAT_STYLES) {
		const btn = el("button",
			"aw-wardrobe-choice" + (cfg.hat === style.id ? " aw-wardrobe-choice--selected" : ""),
			style.label);
		btn.type = "button";
		btn.title = style.description;
		btn.setAttribute("aria-pressed", cfg.hat === style.id ? "true" : "false");
		btn.addEventListener("click", () => {
			saveWardrobe({ hat: style.id });
			refresh();
		});
		choices.appendChild(btn);
	}
	wrap.appendChild(choices);
	return wrap;
}

function toggleRow(section, cfg, refresh) {
	const wrap = el("button", "aw-wardrobe-toggle" + (cfg[section.key] ? " aw-wardrobe-toggle--on" : ""));
	wrap.type = "button";
	wrap.setAttribute("aria-pressed", cfg[section.key] ? "true" : "false");
	const label = el("span", "aw-wardrobe-toggle-label", section.label);
	const pill = el("span", "aw-wardrobe-pill");
	pill.appendChild(el("span", "aw-wardrobe-pill-knob"));
	wrap.appendChild(label);
	wrap.appendChild(pill);
	wrap.addEventListener("click", () => {
		saveWardrobe({ [section.key]: !cfg[section.key] });
		refresh();
	});
	return wrap;
}

/**
 * Builds the wardrobe panel element. Re-renders live when the wardrobe
 * changes in any tab or game.
 */
export function createWardrobePanel() {
	const panel = el("section", "aw-wardrobe");
	panel.setAttribute("aria-label", "Chossid wardrobe");

	const header = el("header", "aw-wardrobe-header");
	header.appendChild(el("h2", "aw-wardrobe-title", "Dress Your Chossid"));
	header.appendChild(el("p", "aw-wardrobe-subtitle",
		"Your look follows you into every game."));
	panel.appendChild(header);

	const body = el("div", "aw-wardrobe-body");
	panel.appendChild(body);

	const footer = el("footer", "aw-wardrobe-footer");
	const resetBtn = el("button", "aw-wardrobe-reset", "Reset to classic");
	resetBtn.type = "button";
	resetBtn.addEventListener("click", () => {
		resetWardrobe();
		render();
	});
	footer.appendChild(resetBtn);
	panel.appendChild(footer);

	let unsubscribe = null;

	function render() {
		const cfg = loadWardrobe();
		body.textContent = "";
		body.appendChild(hatRow(cfg, render));
		for (const section of COLOR_SECTIONS) body.appendChild(colorRow(section, cfg, render));
		for (const section of HAT_COLOR_SECTIONS) body.appendChild(colorRow(section, cfg, render));
		const toggles = el("div", "aw-wardrobe-toggles");
		for (const section of TOGGLE_SECTIONS) toggles.appendChild(toggleRow(section, cfg, render));
		body.appendChild(toggles);
	}

	render();
	unsubscribe = subscribeWardrobe(() => render());
	panel.addEventListener("aw-wardrobe-destroy", () => {
		if (unsubscribe) unsubscribe();
	}, { once: true });

	return panel;
}

/** Opens the wardrobe in a modal dialog. Returns a close function. */
export function openWardrobeDialog() {
	const overlay = el("div", "aw-wardrobe-overlay");
	const dialog = el("div", "aw-wardrobe-dialog");
	dialog.setAttribute("role", "dialog");
	dialog.setAttribute("aria-modal", "true");
	dialog.setAttribute("aria-label", "Chossid wardrobe");
	const closeBtn = el("button", "aw-wardrobe-close", "×");
	closeBtn.type = "button";
	closeBtn.setAttribute("aria-label", "Close wardrobe");
	dialog.appendChild(closeBtn);
	dialog.appendChild(createWardrobePanel());
	overlay.appendChild(dialog);
	document.body.appendChild(overlay);

	function close() {
		overlay.dispatchEvent(new CustomEvent("aw-wardrobe-destroy"));
		overlay.remove();
		document.removeEventListener("keydown", onKey);
	}
	function onKey(event) {
		if (event.key === "Escape") close();
	}
	closeBtn.addEventListener("click", close);
	overlay.addEventListener("click", (event) => {
		if (event.target === overlay) close();
	});
	document.addEventListener("keydown", onKey);
	return close;
}

const SHIRT_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
	'<path fill="currentColor" d="M20.4 8.6 16 5.5c-.3-.2-.7-.3-1-.3H9c-.3 0-.7.1-1 .3L3.6 8.6c-.4.3-.6.8-.4 1.3l1.4 3.2c.2.4.6.6 1 .5l1.4-.3v6.2c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-6.2l1.4.3c.4.1.8-.1 1-.5l1.4-3.2c.2-.5 0-1-.4-1.3zM9 4.5h6v1.2c0 .8-.7 1.5-1.5 1.5h-3c-.8 0-1.5-.7-1.5-1.5V4.5z"/>' +
	'</svg>';

/**
 * Attaches a floating wardrobe button to the page. Tapping it opens
 * the wardrobe dialog. Call once per game.
 */
export function attachWardrobeButton(container) {
	const host = container || document.body;
	if (host.querySelector(".aw-wardrobe-fab")) return null;
	const btn = el("button", "aw-wardrobe-fab");
	btn.type = "button";
	btn.innerHTML = SHIRT_SVG;
	btn.setAttribute("aria-label", "Open wardrobe — dress your chossid");
	btn.title = "Wardrobe";
	btn.addEventListener("click", () => openWardrobeDialog());
	host.appendChild(btn);
	return btn;
}
