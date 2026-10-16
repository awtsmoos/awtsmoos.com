//B"H
//Boruch Hashem
//Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { apiCatalog } = require('../../docs/catalog.js');
const { docsPage } = require('../docsPage.js');
const { docsStyles } = require('../docsStyles.js');
const Resource = require('../../mcp/resource.js');

test('machine and human MCP documentation share canonical OAuth resource', () => {
  assert.equal(apiCatalog.mcp.endpoint, Resource.MCP_RESOURCE);
  assert.equal(apiCatalog.mcp.protectedResourceMetadata, Resource.PROTECTED_RESOURCE_METADATA);
  const page = docsPage(apiCatalog);
  assert.match(page, /Awtsmoos Shliach MCP integration/);
  assert.match(page, /WWW-Authenticate/);
  assert.match(page, /awtsmoos_action_schema/);
  assert.match(page, /awtsmoos_tunnel_action/);
  assert.match(page, /id="mcp"/);
  assert.match(page, /href="#mcp"/);
});
test('docs CSS remains legible, scrollable and keyboard accessible on narrow screens', () => {
  const css = docsStyles();
  for (const text of [':focus-visible','overflow-x: auto','@media (max-width: 640px)','prefers-reduced-motion']) {
    assert(css.includes(text), text);
  }
});
