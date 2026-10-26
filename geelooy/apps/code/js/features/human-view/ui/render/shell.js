//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders the neon Human Takeover chamber around one semantic document.
 * The Awtsmoos surrounds every finite mode and depth without being divided by any of them;
 * Awtsmoos.com therefore gives one shell to Document, Map, Behavior, Source, and persistent human feedback.
 */

import { HUMAN_LEVELS } from "../../model/levels.js";
import { HUMAN_MODES } from "../modes.js";
import { escapeHuman } from "../templates.js";

const LEVEL_GLYPHS = Object.freeze({ meaning: "◎", structure: "⌘", behavior: "⚙", source: "</>" });

function modeButtons(mode, compact = false) {
	return HUMAN_MODES.map(item => `<button type="button" class="human-mode-button" data-human-mode-choice="${item.id}" aria-pressed="${item.id === mode}"><span class="human-mode-glyph">${escapeHuman(item.glyph)}</span><span>${escapeHuman(item.label)}</span>${compact ? "" : `<small>${escapeHuman(item.description)}</small>`}</button>`).join("");
}

function levelButtons(level) {
	return HUMAN_LEVELS.map((item, index) => `<button type="button" data-human-level-choice="${item.id}" aria-pressed="${item.id === level}"><span class="human-level-number">${index + 1}</span><span class="human-level-glyph">${escapeHuman(LEVEL_GLYPHS[item.id])}</span><strong>${escapeHuman(item.label)}</strong><small>${escapeHuman(item.description)}</small></button>`).join("");
}

/** Renders the complete inner shell while keeping all interactions delegated at the persistent root. */
export function renderHumanShell({ documentModel, mode, level, body, feedback = {} }) {
	const identity = documentModel?.identity || {};
	const name = identity.name || "Reading source…";
	const language = documentModel?.language || "Semantic analysis";
	const message = escapeHuman(feedback.message || "");
	const tone = escapeHuman(feedback.tone || "info");
	return `
		<div class="human-takeover-shell" data-human-mode="${escapeHuman(mode)}">
			<header class="human-takeover-header">
				<div class="human-brand-lockup"><span class="human-brand-mark">H</span><div><p class="human-brand">Human Takeover <span>LIVE</span></p><h1 id="human-takeover-title">${escapeHuman(name)}</h1><p>${escapeHuman(language)} · Source-linked semantic workspace</p></div></div>
				<div class="human-header-actions"><button type="button" data-human-action="source-first">Source</button><button type="button" data-human-action="refresh">Refresh</button><button type="button" data-human-action="close" aria-label="Close Human Takeover">Close</button></div>
			</header>
			<nav class="human-mode-tabs" aria-label="Human Takeover views">${modeButtons(mode)}</nav>
			<div class="human-takeover-layout"><nav class="human-zoom" aria-label="Semantic depth">${levelButtons(level)}</nav><main class="human-canvas"><div id="human-takeover-feedback" class="human-global-feedback" data-tone="${tone}" aria-live="polite">${message}</div><div id="human-view-body">${body}</div></main></div>
			<nav class="human-mobile-dock" aria-label="Human Takeover mobile views">${modeButtons(mode, true)}</nav>
		</div>`;
}
