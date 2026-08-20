//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { apiCatalog } = require('../catalog.js');
const { actionsSection } = require('../../views/docsActionSection.js');
const { setupSection, routingSection, examplesSection } = require('../../views/docsSections.js');

/**
 * The Awtsmoos proves public documentation teaches one honest publication path:
 * immutable OAuth routing, no-install hosted source, canonical URL testimony,
 * and real action contracts instead of the old false “no params” shadow.
 */

test('publication actions remain in flat compatibility list with rich contracts', () => {
	for (const action of [
		'sitePublishBootstrap',
		'sitePublishFolder',
		'sitePublicationStatus',
		'siteUnpublish'
	]) {
		assert.equal(apiCatalog.actions.includes(action), true, action);
		assert.equal(Boolean(apiCatalog.actionCatalog[action]), true, action);
	}
	assert.equal(apiCatalog.actionCatalog.sitePublishFolder.scope, 'tunnel.write');
	assert.equal(apiCatalog.actionCatalog.sitePublicationStatus.scope, 'tunnel.read');
});

test('setup teaches immutable OAuth routing and Virtual OS without native agent', () => {
	assert.equal(apiCatalog.setup.oauth.routingField, 'routeReference');
	assert.equal(apiCatalog.setup.virtualOs.availableWithoutAgent, true);
	assert.match(apiCatalog.setup.publicUrlRule, /publication\.canonicalUrl/);
	assert.match(setupSection(apiCatalog), /No native agent installation is required/);
	assert.match(routingSection(apiCatalog), /routeReference/);
});

test('human actions and examples expose direct publish contract without false no-params claims', () => {
	const html = actionsSection(apiCatalog);
	assert.match(html, /sitePublishFolder/);
	assert.match(html, /mode=direct\|snapshot/);
	assert.match(html, /tunnel\.write/);
	assert.doesNotMatch(html, /no params/i);
	assert.match(examplesSection(), /publication\.canonicalUrl/);
	assert.match(examplesSection(), /sitePublishFolder/);
});
