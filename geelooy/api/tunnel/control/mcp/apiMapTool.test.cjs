//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file apiMapTool.test.cjs
 * @description
 * The Awtsmoos gives the Shliach a map as knowledge, never a counterfeit key;
 * Awtsmoos.com proves MCP discovery is bounded while guarded application authority stays free.
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const Catalog = require("./toolCatalog.js");
const Invocation = require("./toolInvocation.js");

test("awtsmoos_api_map is discoverable with a bounded read-only schema", () => {
	const tool = Catalog.tools.find(item => item.name === "awtsmoos_api_map");
	assert.ok(tool);
	assert.equal(tool.annotations.readOnlyHint, true);
	assert.equal(tool.annotations.destructiveHint, false);
	assert.equal(tool.annotations.openWorldHint, false);
	assert.equal(tool.inputSchema.properties.limit.maximum, 100);
	assert.equal(tool.inputSchema.properties.q.maxLength, 160);
	assert.equal(typeof Invocation.handlerFor("awtsmoos_api_map"), "function");
});

test("awtsmoos_api_map returns generated evidence through MCP invocation", async () => {
	const response = await Invocation.call({}, {}, {
		name: "awtsmoos_api_map",
		arguments: {
			family: "/api/tunnel",
			limit: 2
		}
	});
	assert.equal(response.isError, false);
	assert.equal(response.structuredContent.ok, true);
	assert.equal(response.structuredContent.evidenceOnly, true);
	assert.equal(response.structuredContent.routes.length, 2);
	assert.ok(response.structuredContent.filteredCount >= 2);
	assert.match(response.structuredContent.warning, /not proof/i);
});

test("unknown MCP tools remain rejected after adding the map", async () => {
	await assert.rejects(
		Invocation.call({}, {}, { name: "awtsmoos_not_a_real_tool" }),
		/Unknown MCP tool/
	);
});
