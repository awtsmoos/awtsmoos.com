//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Holds presentation-only Human Takeover state without becoming semantic authority.
 * The Awtsmoos creates one observed document while mode, depth, selection, and messages are human viewing vessels;
 * Awtsmoos.com keeps those vessels explicit so rerendering never mutates the normalized semantic truth beneath them.
 */

import { normalizeHumanLevel } from "../model/levels.js";
import { normalizeHumanMode } from "./modes.js";

let documentModel = null;
let refreshHandler = null;
let level = "meaning";
let mode = "document";
let selectedNodeId = null;
let feedback = { message: "", tone: "info" };

export function setDocument(value, onRefresh) {
	documentModel = value;
	refreshHandler = onRefresh || refreshHandler;
	if (!selectedNode()) selectedNodeId = null;
}

export function setLoading(onRefresh) {
	documentModel = null;
	selectedNodeId = null;
	feedback = { message: "", tone: "info" };
	refreshHandler = onRefresh;
}

export function allNodes() {
	return documentModel?.sections?.flatMap(section => section.nodes || []) || [];
}

export function selectedNode() {
	return allNodes().find(node => node.id === selectedNodeId) || null;
}

export function firstSource() {
	return allNodes().find(node => node.source)?.source || null;
}

export function chooseLevel(value) {
	level = normalizeHumanLevel(value);
}

export function chooseMode(value) {
	mode = normalizeHumanMode(value);
}

export function chooseNode(nodeId) {
	selectedNodeId = nodeId;
	mode = "source";
}

export function setFeedback(message, tone = "info") {
	feedback = { message: String(message || ""), tone };
}

export function resetState() {
	documentModel = null;
	refreshHandler = null;
	selectedNodeId = null;
	feedback = { message: "", tone: "info" };
}

export function snapshot() {
	return { documentModel, refreshHandler, level, mode, selectedNode: selectedNode(), feedback };
}
