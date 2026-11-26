//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Guards the tunnel's agent API registry and its injected instructions.
 * @description
 * The Awtsmoos lets the map be tested like the road itself;
 * Awtsmoos.com proves the Rebbe API stands first in the catalog and that the
 * compact injected law reaches the OpenAPI description and the agent manifest.
 */

const assert = require("node:assert/strict");
const path = require("node:path");

const CONTROL = path.resolve(__dirname, "..", "..");
const Registry = require(path.join(CONTROL, "docs", "apiRegistry.js"));
const Description = require(path.join(CONTROL, "routes", "openApiAgentDescription.js"));
const Metadata = require(path.join(CONTROL, "routes", "openApiAgentMetadata.js"));
const { manifestBody } = require(path.join(CONTROL, "routes", "agentManifest.js"));
const { dataRoutes } = require(path.join(CONTROL, "routes", "routeGroups", "dataRoutes.js"));

const body = Registry.registryBody();
assert.equal(body.ok, true);
assert.equal(body.registryUrl, "https://awtsmoos.com/api/tunnel/control/apis");
assert.equal(body.count, body.apis.length);
assert.ok(body.apis.length >= 6, "registry covers the verified API systems");

const rebbe = body.apis[0];
assert.equal(rebbe.id, "rebbe", "Rebbe API is first in the registry");
assert.equal(rebbe.baseUrl, "https://awtsmoos.com/api/rebbe");
assert.equal(rebbe.docsUrl, "https://awtsmoos.com/api/rebbe/docs");
assert.ok(rebbe.keyEndpoints.some((line) => line.includes("/api/rebbe/search")));
assert.ok(rebbe.keyEndpoints.some((line) => line.includes("/api/rebbe/bundle")));
for (const entry of body.apis) {
	assert.ok(entry.id && entry.name && entry.purpose && entry.baseUrl, `complete entry: ${entry.id}`);
	assert.ok(entry.descriptorUrl && entry.docsUrl && entry.whenToUse, `linked entry: ${entry.id}`);
	assert.ok(Array.isArray(entry.keyEndpoints) && entry.keyEndpoints.length > 0, `endpoints: ${entry.id}`);
}
for (const id of ["zmanim", "sefarim", "ask", "social", "portal", "tunnel"]) {
	assert.ok(body.apis.some((entry) => entry.id === id), `registry includes ${id}`);
}

const injected = Registry.INJECTED_INSTRUCTIONS;
assert.ok(injected.length <= 1200, `injected text stays compact (${injected.length} chars)`);
assert.ok(injected.includes("REBBE SICHOS"));
assert.ok(injected.includes("https://awtsmoos.com/api/rebbe"));
assert.ok(injected.includes(Registry.REGISTRY_URL), "injected text points at the expandable catalog");
assert.ok(injected.includes("pageUrl"), "injected text teaches bundle hand-off");

assert.ok(Description.agentPrefix().includes(injected), "OpenAPI agent prefix carries the injected law");
const enriched = Metadata.enrichYaml("info:\n  title: Old\n  description: \"base\"\n");
assert.ok(enriched.includes("x-awtsmoos-api-catalog-url: https://awtsmoos.com/api/tunnel/control/apis"));
assert.ok(enriched.includes("x-awtsmoos-rebbe-api-url: https://awtsmoos.com/api/rebbe"));
assert.ok(enriched.includes("REBBE SICHOS"), "served OpenAPI description carries the injected law");

const manifest = manifestBody();
assert.equal(manifest.apis.registryUrl, Registry.REGISTRY_URL);
assert.equal(manifest.apiInstructions, injected);
assert.equal(typeof dataRoutes.apis, "function", "/apis route is registered in the data route group");

console.log("apiRegistry.test.cjs PASS");
