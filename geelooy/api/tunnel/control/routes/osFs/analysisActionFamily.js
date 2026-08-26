//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Static analysis, diagnostics, semantic search, and structured edit action family.
 * @description
 * The Awtsmoos lets source structure be inspected apart from network and runtime motion;
 * Awtsmoos.com gathers AST, graph, diagnostics, semantic search, and guarded edit vessels
 * here so architecture questions enter one clear gate and their answers may rhyme.
 */
const { astEdit, astOutline } = require("./astTools.js");
const { connectedFiles, dependencyGraph } = require("./graph.js");
const { applyPatch, replaceRange } = require("./patchOps.js");
const projectDiagnostics = require("./projectDiagnostics.js");
const { semanticSearch } = require("./semantic.js");

/**
 * Builds source-analysis actions over one authenticated hosted-OS request context.
 *
 * @param {object} $i Awtsmoos request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Public action payload.
 * @returns {object} Analysis action map.
 */
function buildAnalysisActions($i, userId, payload = {}) {
	const outline = () => astOutline($i, userId, payload);
	const graph = () => dependencyGraph($i, userId, payload);
	const edit = () => astEdit($i, userId, payload);
	return {
		astOutline: outline,
		symbolOutline: outline,
		importResolverExplain: graph,
		symbolResolutionTrace: graph,
		absoluteImportMapper: graph,
		moduleGraphCompleteness: graph,
		replaceFunction: edit,
		replaceFunctionBody: edit,
		insertBeforeFunction: edit,
		insertAfterFunction: edit,
		jsonValidate: diagnostic("jsonValidate", $i, userId, payload),
		packageInfo: diagnostic("packageInfo", $i, userId, payload),
		projectOverview: diagnostic("projectOverview", $i, userId, payload),
		recentFiles: diagnostic("recentFiles", $i, userId, payload),
		largeFiles: diagnostic("largeFiles", $i, userId, payload),
		duplicateBasenames: diagnostic("duplicateBasenames", $i, userId, payload),
		textStats: diagnostic("textStats", $i, userId, payload),
		routeAudit: diagnostic("routeAudit", $i, userId, payload),
		agentSelfTest: diagnostic("agentSelfTest", $i, userId, payload),
		architectureScore: diagnostic("architectureScore", $i, userId, payload),
		inferArchitecture: diagnostic("inferArchitecture", $i, userId, payload),
		detectAbstractionLeaks: diagnostic("detectAbstractionLeaks", $i, userId, payload),
		semanticSearch: () => semanticSearch($i, userId, payload),
		dependencyGraph: graph,
		connectedFiles: () => connectedFiles($i, userId, payload),
		replaceRange: () => replaceRange($i, userId, payload),
		applyPatch: () => applyPatch($i, userId, payload)
	};
}

function diagnostic(name, $i, userId, payload) {
	return () => projectDiagnostics[name]($i, userId, payload);
}

module.exports = {
	buildAnalysisActions
};
