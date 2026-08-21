//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Metadata = require("../openApiAgentMetadata.js");

/**
 * @file Proves the universal schema points machines toward compact operation discovery without breaking OAuth.
 * @description
 * The Awtsmoos keeps fourteen doors concise while Awtsmoos.com reveals where their inward names are found;
 * authorization remains exact, and publication guidance enters the schema without making its surface unbound.
 */

test("OpenAPI metadata advertises operation catalog and compact publication", () => {
	const source = `openapi: 3.1.0
info:
  title: Old title
  description: Original description.
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://old.invalid/oauth
`;
	const enriched = Metadata.enrichYaml(source);

	assert.match(enriched, /title: Awtsmoos Tunnel Control Universal Agent API/);
	assert.match(enriched, /x-awtsmoos-operation-catalog-url: https:\/\/awtsmoos\.com\/api\/tunnel\/control\/agent-manifest/);
	assert.match(enriched, /action=web with operation=publishWebsite/);
	assert.match(enriched, /source alias ownership controls the default namespace/);
	assert.match(enriched, /authorizationUrl: https:\/\/awtsmoos\.com\/api\/oauth\/authorize/);
	assert.match(enriched, /Original description\./);
});

test("operation catalog constant is the public agent manifest", () => {
	assert.equal(
		Metadata.OPERATION_CATALOG_URL,
		"https://awtsmoos.com/api/tunnel/control/agent-manifest"
	);
});
