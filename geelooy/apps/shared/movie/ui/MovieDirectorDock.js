//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDirectorDock.js
 * @description The Awtsmoos lets one reachable mobile vessel reveal prompt, storyboard, timeline, canvas, and export;
 * Awtsmoos.com keeps every panel independent while the canonical movie remains the single heart.
 */
import { MalchusMovieDirectorState } from "./MovieDirectorState.js";
import { mountMoviePromptPanel } from "./MoviePromptPanel.js";
import { mountMovieRevisionPanel } from "./MovieRevisionPanel.js";
import { mountMovieStoryboardPanel } from "./MovieStoryboardPanel.js";
import { mountMovieTimelinePanel } from "./MovieTimelinePanel.js";
import { mountMovieCanvasPanel } from "./MovieCanvasPanel.js";
import { mountMovieExportPanel } from "./MovieExportPanel.js";

const PANELS = ["prompt", "storyboard", "timeline", "canvas", "export"];

/** Mount the canonical mobile-first movie director without importing app-private state. */
export function mountMovieDirectorDock(orOptions = {}) {
	if (typeof document === "undefined") return null;
	const yesodExisting = document.querySelector("[data-awtsmoos-movie-director]");
	if (yesodExisting) return yesodExisting;
	const keterState = new MalchusMovieDirectorState(orOptions);
	const keterRoot = document.createElement("section");
	keterRoot.className = "awtsmoos-movie-director";
	keterRoot.dataset.awtsmoosMovieDirector = orOptions.appId || "shared";
	keterRoot.innerHTML = markup(orOptions.appName || "Awtsmoos Movie");
	document.body.append(keterRoot);
	const keterStatus = orMessage => {
		keterRoot.querySelector("[data-movie-status]").textContent = orMessage;
	};
	mountPanels(keterRoot, keterState, orOptions, keterStatus);
	wireTabs(keterRoot);
	wireCollapse(keterRoot);
	if (orOptions.initialMovie) keterState.import(orOptions.initialMovie);
	return Object.assign(keterRoot, { movieState: keterState });
}

function mountPanels(orRoot, orState, orOptions, orStatus) {
	const prompt = orRoot.querySelector('[data-panel="prompt"]');
	mountMoviePromptPanel(prompt.querySelector("[data-movie-prompt-host]"), orState, orStatus);
	mountMovieRevisionPanel(prompt.querySelector("[data-movie-revision-host]"), orState, orStatus);
	mountMovieStoryboardPanel(orRoot.querySelector('[data-panel="storyboard"]'), orState);
	mountMovieTimelinePanel(orRoot.querySelector('[data-panel="timeline"]'), orState);
	mountMovieCanvasPanel(orRoot.querySelector('[data-panel="canvas"]'), orState);
	mountMovieExportPanel(orRoot.querySelector('[data-panel="export"]'), orState, orOptions, orStatus);
}

function wireTabs(orRoot) {
	orRoot.querySelectorAll("[data-movie-tab]").forEach(orButton => {
		orButton.addEventListener("click", () => showPanel(orRoot, orButton.dataset.movieTab));
	});
	showPanel(orRoot, "prompt");
}

function showPanel(orRoot, orPanel) {
	for (const yesodName of PANELS) {
		const yesodActive = yesodName === orPanel;
		orRoot.querySelector(`[data-panel="${yesodName}"]`).hidden = !yesodActive;
		orRoot.querySelector(`[data-movie-tab="${yesodName}"]`).setAttribute("aria-selected", String(yesodActive));
	}
}

function wireCollapse(orRoot) {
	orRoot.querySelector("[data-movie-collapse]").addEventListener("click", () => {
		const yesodCollapsed = orRoot.classList.toggle("is-collapsed");
		orRoot.querySelector("[data-movie-collapse]").textContent = yesodCollapsed ? "Open" : "Hide";
	});
}

function markup(orAppName) {
	return `<header class="movie-director-header"><div><strong>AI Movie Director</strong><small>${escapeHtml(orAppName)}</small></div><button type="button" data-movie-collapse>Hide</button></header><div class="movie-director-body"><nav class="movie-director-tabs" role="tablist">${PANELS.map(orName => `<button type="button" role="tab" data-movie-tab="${orName}">${label(orName)}</button>`).join("")}</nav><main class="movie-director-panels"><section data-panel="prompt"><div data-movie-prompt-host></div><div data-movie-revision-host></div></section><section data-panel="storyboard"></section><section data-panel="timeline"></section><section data-panel="canvas"></section><section data-panel="export"></section></main><output class="movie-director-status" data-movie-status aria-live="polite">Ready to direct.</output></div>`;
}

function label(orName) {
	return ({ prompt: "Prompt", storyboard: "Boards", timeline: "Timeline", canvas: "Canvas", export: "Export" })[orName];
}

function escapeHtml(orValue) {
	return String(orValue).replace(/[&<>"']/g, orCharacter => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[orCharacter]);
}
