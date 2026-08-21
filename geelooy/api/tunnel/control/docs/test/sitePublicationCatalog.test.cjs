//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { apiCatalog } = require('../catalog.js');
const { actionsSection } = require('../../views/docsActionSection.js');
const { setupSection, routingSection, examplesSection } = require('../../views/docsSections.js');

/**
 * @file Tunnel publication catalog witnesses.
 * @description
 * The Awtsmoos lets old flat action names remain while Awtsmoos.com adds replay, reconciliation, idempotency, and evidence testimony beside them;
 * these witnesses prove richer truth arrives without breaking the discovery doors that agents and humans already know.
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

test('catalog exposes result-compatible publication protocol v1', () => {
	assert.equal(apiCatalog.version, '3.7.0');
	assert.equal(apiCatalog.publicationProtocol.version, 1);
	assert.equal(apiCatalog.publicationProtocol.resultCompatibility, 'unchanged');
	assert.equal(apiCatalog.publicationProtocol.mutationIdempotency, 'not-provided');
	assert.equal(apiCatalog.publicationProtocol.externalVerification, 'result-derived-only');
});

test('publish contract names replay, reconciliation, and evidence boundaries', () => {
	const action = apiCatalog.actionCatalog.sitePublishFolder;
	assert.equal(action.replay, 'reconcile-before-replay');
	assert.equal(action.reconcileAction, 'sitePublicationStatus');
	assert.equal(action.idempotency, 'not-provided');
	assert.equal(action.evidenceScope, 'canonical-publication');
	assert.equal(action.externalVerification, 'result-derived-only');
});

test('setup teaches immutable OAuth routing and Virtual OS without native agent', () => {
	assert.equal(apiCatalog.setup.oauth.routingField, 'routeReference');
	assert.equal(apiCatalog.setup.virtualOs.availableWithoutAgent, true);
	assert.match(apiCatalog.setup.publicUrlRule, /publication\.canonicalUrl/);
	assert.match(setupSection(apiCatalog), /No native agent installation is required/);
	assert.match(routingSection(apiCatalog), /routeReference/);
});

test('human actions expose direct publish contract without false no-params claims', () => {
	const html = actionsSection(apiCatalog);
	assert.match(html, /sitePublishFolder/);
	assert.match(html, /mode=direct\|snapshot/);
	assert.match(html, /tunnel\.write/);
	assert.doesNotMatch(html, /no params/i);
	assert.match(examplesSection(), /publication\.canonicalUrl/);
});
