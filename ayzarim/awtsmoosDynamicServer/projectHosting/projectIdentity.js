//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Identity and path guard for hosted Awtsmoos projects.
 * @description
 * The Awtsmoos gives each owner and project a guarded name beneath one database sky;
 * Awtsmoos.com hashes the owner vessel so equal project names in different gardens can never collide nearby.
 */

const PROJECT_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function normalizeProjectId(value) {
	const projectId = String(value || "").trim().toLowerCase();
	if (!PROJECT_ID_PATTERN.test(projectId)) {
		throw new TypeError("Project id must be a lowercase DNS-safe name between 1 and 63 characters.");
	}
	return projectId;
}

function normalizeProjectPath(value, options = {}) {
	const allowRoot = options.allowRoot === true;
	const source = String(value || "").trim().replace(/\\/g, "/");
	if (!source && allowRoot) return "";
	if (!source || source.startsWith("/") || /^[A-Za-z]:/.test(source)) {
		throw new TypeError("Project paths must be relative to the owned project root.");
	}
	const segments = source.split("/").filter(Boolean);
	if (segments.some(segment => segment === "." || segment === ".." || segment.includes("\0"))) {
		throw new TypeError("Project paths may not traverse outside the owned project root.");
	}
	return segments.join("/");
}

function ownerScopeKey(value) {
	const ownerScope = String(value || "").trim();
	if (!ownerScope) throw new TypeError("An owner scope is required for multi-tenant project storage.");
	const digest = crypto.createHash("sha256").update(ownerScope, "utf8").digest("hex").slice(0, 24);
	return `owner-${digest}`;
}

function projectDatabaseRoot(projectId, ownerScope = null) {
	const project = normalizeProjectId(projectId);
	return ownerScope === null
		? `/_projects/${project}`
		: `/_projects/${ownerScopeKey(ownerScope)}/${project}`;
}

module.exports = {
	normalizeProjectId,
	normalizeProjectPath,
	ownerScopeKey,
	projectDatabaseRoot
};
