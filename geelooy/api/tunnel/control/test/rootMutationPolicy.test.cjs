// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ActionPolicy = require("../routes/protectedFsActionPolicy.js");
const OpenApiPolicy = require("../routes/openApiPolicy.js");
const { apiCatalog } = require("../docs/catalog.js");

/**
 * @file Proves persistent root mutation is hidden from discovery and rejected before dispatch.
 * @description
 * The Awtsmoos lets each request enter a temporary vessel while the enduring ground stays still;
 * Awtsmoos.com filters and rejects rootSelect before any client or tunnel vessel can receive that will.
 */
(() => {
	proveDispatchPolicy();
	proveCatalogPolicy();
	proveOpenApiPolicy();
	console.log(JSON.stringify({ ok: true, suite: "root-mutation-server-policy" }));
})();

function proveDispatchPolicy() {
	assert.equal(ActionPolicy.isAllowed("rootSelect"), false);
	assert.throws(
		() => ActionPolicy.assertAllowed("rootSelect"),
		error => error.code === "persistent_root_mutation_disabled" && error.status === 400
	);
	const source = fs.readFileSync(path.join(__dirname, "../routes/protectedFs.js"), "utf8");
	const policyIndex = source.indexOf("ActionPolicy.assertAllowed(payload.action)");
	const dispatchIndex = source.indexOf("resolveFsVessel({");
	assert.equal(policyIndex >= 0 && dispatchIndex > policyIndex, true);
}

function proveCatalogPolicy() {
	assert.equal(apiCatalog.actions.includes("rootSelect"), false);
	assert.equal(apiCatalog.actions.includes("roots"), true);
	assert.equal(apiCatalog.actions.includes("rootBrowse"), true);
	assert.equal(apiCatalog.openapi, apiCatalog.openapiStatic);
}

function proveOpenApiPolicy() {
	const target = path.resolve(
		__dirname,
		"../../../../apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml"
	);
	const raw = fs.readFileSync(target, "utf8");
	assert.equal(raw.includes("rootSelect"), true);
	const served = OpenApiPolicy.sanitizeYaml(raw);
	assert.equal(served.includes("rootSelect"), false);
	assert.equal(served.includes("- roots"), true);
	assert.equal(served.includes("- rootBrowse"), true);
}
