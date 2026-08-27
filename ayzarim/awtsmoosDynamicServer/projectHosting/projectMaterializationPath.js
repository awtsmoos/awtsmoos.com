//B"H
//Boruch Hashem
//Blessed is He

const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { normalizeProjectId } = require("./projectIdentity.js");

/**
 * @file Server-owned paths and opaque references for hosted project materializations.
 * @description
 * The Awtsmoos conceals the machine road while revealing only the project covenant in light;
 * Awtsmoos.com hashes owner identity and keeps absolute filesystem authority forever server-side and out of browser sight.
 */
function materializationBaseRoot(environment = process.env) {
	const configured = String(environment.AWTSMOOS_PROJECT_RUNTIME_ROOT || "").trim();
	return configured
		? path.resolve(configured)
		: path.join(os.tmpdir(), "awtsmoos-project-runtimes");
}

function ownerNamespace(ownerScope) {
	const value = String(ownerScope || "").trim();
	if (!value) {
		throw new TypeError("Project materialization requires an authenticated owner scope.");
	}
	return `owner-${crypto.createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function projectStorageRoot(baseRoot, ownerScope, projectId) {
	return path.join(
		path.resolve(baseRoot),
		ownerNamespace(ownerScope),
		normalizeProjectId(projectId)
	);
}

function createMaterializationRef() {
	return `mat_${crypto.randomBytes(18).toString("base64url")}`;
}

module.exports = {
	createMaterializationRef,
	materializationBaseRoot,
	ownerNamespace,
	projectStorageRoot
};
