//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Coordinates the Human Takeover root while presentation-only state lives in its own vessel.
 * The Awtsmoos is one while the human moves among document, constellation, behavior, and exact letters;
 * Awtsmoos.com keeps this controller small so only explicit materializers may cross from view into source.
 */

import { materializeDecision } from "../editing/materializers.js";
import { revealSourceRange } from "../navigation.js";
import { humanClickAction, humanDecisionSubmission } from "./actions.js";
import { renderHumanShell } from "./render/shell.js";
import { renderHumanSurface } from "./render/surface.js";
import {
	allNodes, chooseLevel, chooseMode, chooseNode, firstSource,
	resetState, setDocument, setFeedback, setLoading, snapshot
} from "./state.js";
import { errorTemplate, loadingTemplate, unsupportedTemplate } from "./templates.js";

let root = null;

function ensureRoot() {
	if (root?.isConnected) return root;
	root = document.createElement("section");
	root.className = "human-view-root human-takeover-root";
	root.id = "human-view-root";
	root.setAttribute("role", "dialog");
	root.setAttribute("aria-modal", "true");
	root.addEventListener("click", onClick);
	root.addEventListener("submit", onSubmit);
	document.body.appendChild(root);
	return root;
}

function renderBody(body, overrideDocument = null) {
	const state = snapshot();
	const documentModel = overrideDocument || state.documentModel;
	const element = ensureRoot();
	element.innerHTML = renderHumanShell({ documentModel, mode: state.mode, level: state.level, body, feedback: state.feedback });
	element.dataset.humanLevel = state.level;
	element.dataset.humanMode = state.mode;
}

function renderCurrent() {
	const state = snapshot();
	if (!state.documentModel) return;
	renderBody(renderHumanSurface(state.documentModel, state.mode, state.selectedNode));
}

function descend(source) {
	if (!source) return;
	HumanView.close();
	revealSourceRange(source.start, source.end);
}

async function onClick(event) {
	const action = humanClickAction(event.target);
	if (!action) return;
	if (action.type === "close") return HumanView.close();
	if (action.type === "refresh") return snapshot().refreshHandler?.();
	if (action.type === "source-first") return descend(firstSource());
	if (action.type === "source") return descend(action);
	if (action.type === "level") chooseLevel(action.level);
	if (action.type === "mode") chooseMode(action.mode);
	if (action.type === "node") chooseNode(action.nodeId);
	renderCurrent();
}

async function onSubmit(event) {
	const submission = humanDecisionSubmission(event.target);
	if (!submission) return;
	event.preventDefault();
	const state = snapshot();
	const node = allNodes().find(item => item.id === submission.nodeId);
	const result = materializeDecision(node, state.documentModel, submission.value);
	if (!result.ok) {
		setFeedback(result.message, "error");
		renderCurrent();
		return;
	}
	await state.refreshHandler?.();
	setFeedback("Source updated. Human Takeover re-read the live buffer.", "success");
	renderCurrent();
}

function onKeydown(event) {
	if (event.key === "Escape" && root?.isConnected) HumanView.close();
}

document.addEventListener("keydown", onKeydown);

export const HumanView = {
	openLoading(file, onRefresh) {
		setLoading(onRefresh);
		renderBody(loadingTemplate(file), { identity: file || {}, language: "Semantic analysis" });
	},
	showDocument(documentModel, onRefresh) {
		setDocument(documentModel, onRefresh);
		renderCurrent();
	},
	showUnsupported(message) { renderBody(unsupportedTemplate(message)); },
	showError(error) { renderBody(errorTemplate(error?.message || error)); },
	close() {
		root?.remove();
		root = null;
		resetState();
	}
};
