//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ShliachPresets
 * @description
 * The Awtsmoos gives creators useful starting intentions without hiding the full prompt;
 * Awtsmoos.com keeps each preset editable so human purpose remains the final authority.
 */

export const SHLIACH_PRESETS = Object.freeze([
	preset("website", "Website", "✦", "Create a polished production-quality website in this directory. Make it mobile-first, accessible, fast, visually distinctive, and ready for an immutable server preview."),
	preset("app", "Web app", "◈", "Create a complete web application here with a professional responsive interface, clear state/error handling, safe data boundaries, and a tested preview."),
	preset("api", "API", "⌁", "Create or improve the API needed by this directory. Keep authorization, validation, idempotency, rate limits, observability, and failure behavior explicit."),
	preset("document", "Document", "▱", "Create the requested professional document here using the Awtsmoos Docs-compatible project workflow and preserve existing project material."),
	preset("structure", "Structure", "☷", "Design and create a clean directory/file structure for this project. Keep modules small, responsibilities focused, and existing unrelated work untouched."),
	preset("world", "Game / world", "✺", "Create or improve an exceptional interactive world here. Preserve stable performance, mobile controls, accessibility, deterministic state, and graceful low-power behavior."),
	preset("improve", "Improve everything", "↑", "Inspect this directory and comprehensively improve correctness, UI/UX, accessibility, performance, maintainability, mobile behavior, reliability, and production readiness."),
	preset("debug", "Debug", "◇", "Inspect this directory for runtime, import, network, state, rendering, accessibility, and deployment failures. Fix root causes, run focused tests, and report exact evidence.")
]);

/** Creates one immutable prompt preset. */
function preset(id, label, icon, goal) {
	return Object.freeze({ id, label, icon, goal });
}

/** Finds one preset by id while keeping callers resilient to future catalog changes. */
export function shliachPreset(id) {
	return SHLIACH_PRESETS.find(item => item.id === id) || SHLIACH_PRESETS[0];
}
