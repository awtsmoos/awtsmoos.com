//B"H
// Boruch Hashem
// Blessed is He

const { normalizeProjectId, normalizeProjectPath, ownerScopeKey, projectDatabaseRoot } = require("./projectIdentity.js");

/**
 * @file Declarative runtime specification for one hosted Awtsmoos project.
 * @description
 * The Awtsmoos reveals a route through declared boundaries instead of an arbitrary shell command;
 * Awtsmoos.com can host living code while owner, database, exposure, and root remain inspectable and planned.
 */

const ROUTE_FILE = "_awtsmoos.derech.js";
const EXPOSURES = new Set(["private", "public"]);
const FORBIDDEN_KEYS = /(?:command|shell|password|secret|token|api.?key|credential|env(?:ironment)?)/i;

function normalizeProjectRuntimeSpec(input = {}) {
	assertNoForbiddenRuntimeKeys(input);
	const projectId = normalizeProjectId(input.projectId || input.id);
	const rootPath = normalizeProjectPath(input.rootPath || projectId);
	const exposure = String(input.exposure || "private").toLowerCase();
	if (!EXPOSURES.has(exposure)) throw new TypeError("Runtime exposure must be either private or public.");
	const ownerKey = input.ownerScope ? ownerScopeKey(input.ownerScope) : null;
	return Object.freeze({
		version: 1,
		projectId,
		rootPath,
		runtimeKind: "awtsmoos-route",
		routeFile: ROUTE_FILE,
		exposure,
		ownerScopeKey: ownerKey,
		databaseRoot: projectDatabaseRoot(projectId, input.ownerScope || null),
		capabilities: Object.freeze(["http-routes", "static-assets", "project-database"])
	});
}

function assertNoForbiddenRuntimeKeys(value, trail = "runtime") {
	if (!value || typeof value !== "object") return;
	for (const [key, child] of Object.entries(value)) {
		if (FORBIDDEN_KEYS.test(key)) {
			throw new TypeError(`Forbidden runtime field at ${trail}.${key}. Use a server-side binding instead.`);
		}
		assertNoForbiddenRuntimeKeys(child, `${trail}.${key}`);
	}
}

module.exports = {
	ROUTE_FILE,
	assertNoForbiddenRuntimeKeys,
	normalizeProjectRuntimeSpec
};
