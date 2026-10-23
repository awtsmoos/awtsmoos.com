//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Owns the Human Takeover workspace, semantic zoom, source descent, and guarded decisions.
 * The Awtsmoos is one while the human moves from meaning toward exact letters and back again;
 * Awtsmoos.com keeps that movement instant, source-linked, keyboard-reachable, and refreshable in place.
 */

import { materializeDecision } from "../editing/materializers.js";
import { HUMAN_LEVELS, normalizeHumanLevel } from "../model/levels.js";
import { revealSourceRange } from "../navigation.js";
import { humanClickAction, humanDecisionSubmission } from "./actions.js";
import { renderHumanDocument } from "./render/document.js";
import { errorTemplate, escapeHuman, loadingTemplate, unsupportedTemplate } from "./templates.js";

let root = null;
let currentDocument = null;
let refreshHandler = null;
let currentLevel = "meaning";

function levelButtons() {
	return HUMAN_LEVELS.map(level => `<button type="button" data-human-level-choice="${level.id}" aria-pressed="${level.id === currentLevel}"><strong>${level.label}</strong><span>${escapeHuman(level.description)}</span></button>`).join("");
}

function ensureRoot() {
	if (root?.isConnected) return root;
	root = document.createElement("section");
	root.className = "human-view-root human-takeover-root";
	root.id = "human-view-root";
	root.innerHTML = `
		<div class="human-takeover-shell" role="dialog" aria-modal="true" aria-labelledby="human-takeover-title">
			<header class="human-takeover-header">
				<div><p class="human-brand">Awtsmoos Code</p><h1 id="human-takeover-title">Human Takeover</h1></div>
				<div class="human-header-actions"><button type="button" data-human-action="source-first">Source</button><button type="button" data-human-action="refresh">Refresh</button><button type="button" data-human-action="close" aria-label="Close Human Takeover">Close</button></div>
			</header>
			<div class="human-takeover-layout"><nav class="human-zoom" aria-label="Semantic zoom">${levelButtons()}</nav><main class="human-canvas"><div id="human-takeover-feedback" class="human-global-feedback" aria-live="polite"></div><div id="human-view-body"></div></main></div>
		</div>`;
	root.addEventListener("click", onClick);
	root.addEventListener("submit", onSubmit);
	document.body.appendChild(root);
	applyLevel(currentLevel);
	return root;
}

function body() {
	return ensureRoot().querySelector("#human-view-body");
}

function feedback(message, tone = "info") {
	const element = ensureRoot().querySelector("#human-takeover-feedback");
	element.textContent = message || "";
	element.dataset.tone = tone;
}

function applyLevel(level) {
	currentLevel = normalizeHumanLevel(level);
	if (!root) return;
	root.dataset.humanLevel = currentLevel;
	root.querySelectorAll("[data-human-level-choice]").forEach(button => button.setAttribute("aria-pressed", String(button.getAttribute("data-human-level-choice") === currentLevel)));
}

function firstSource() {
	return currentDocument?.sections?.flatMap(section => section.nodes || []).find(node => node.source)?.source || null;
}

function nodeById(id) {
	return currentDocument?.sections?.flatMap(section => section.nodes || []).find(node => node.id === id) || null;
}

async function onClick(event) {
	const action = humanClickAction(event.target);
	if (!action) return;
	if (action.type === "close") return HumanView.close();
	if (action.type === "level") return applyLevel(action.level);
	if (action.type === "refresh") return refreshHandler?.();
	const source = action.type === "source-first" ? firstSource() : action.type === "source" ? action : null;
	if (source) {
		HumanView.close();
		revealSourceRange(source.start, source.end);
	}
}

async function onSubmit(event) {
	const submission = humanDecisionSubmission(event.target);
	if (!submission) return;
	event.preventDefault();
	const result = materializeDecision(nodeById(submission.nodeId), currentDocument, submission.value);
	if (!result.ok) return feedback(result.message, "error");
	await refreshHandler?.();
	feedback("Source updated. Human Takeover re-read the live buffer.", "success");
}

function onKeydown(event) {
	if (event.key === "Escape" && root?.isConnected) HumanView.close();
}

document.addEventListener("keydown", onKeydown);

export const HumanView = {
	openLoading(file, onRefresh) {
		refreshHandler = onRefresh;
		ensureRoot();
		body().innerHTML = loadingTemplate(file);
		feedback("");
	},
	showDocument(documentModel, onRefresh) {
		currentDocument = documentModel;
		refreshHandler = onRefresh;
		ensureRoot();
		body().innerHTML = renderHumanDocument(documentModel);
		applyLevel(currentLevel);
		feedback("");
	},
	showUnsupported(message) { ensureRoot(); body().innerHTML = unsupportedTemplate(message); },
	showError(error) { ensureRoot(); body().innerHTML = errorTemplate(error?.message || error); },
	close() { root?.remove(); root = null; currentDocument = null; refreshHandler = null; }
};
