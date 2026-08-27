//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { projectPublicationStatus } = require('../siteProjectStatus.js');

/**
 * The Awtsmoos proves explicit site identity stays canonical even when primary,
 * while source readiness and the convenience alias route remain separate truth.
 */

function readiness(overrides = {}) {
	return {
		ready: true,
		status: 'ready',
		rootPath: 'projects/orbit',
		entryPoint: 'projects/orbit/index.html',
		publicFileCount: null,
		publicBytes: null,
		sourceAvailable: true,
		entryReady: true,
		...overrides
	};
}

test('explicit primary site keeps stable named canonical URL', () => {
	const project = projectPublicationStatus(
		'alpha',
		{
			id: 'orbit',
			title: 'Orbit',
			rootPath: 'projects/orbit',
			primary: true,
			enabled: true,
			source: { kind: 'virtual-os', mode: 'direct', rootPath: 'projects/orbit' }
		},
		readiness()
	);
	assert.equal(project.publication.canonicalPath, '/sites/alpha/orbit/');
	assert.equal(project.publication.canonicalUrl, 'https://awtsmoos.com/sites/alpha/orbit/');
	assert.equal(project.publication.primaryAliasPath, '/sites/alpha/');
	assert.equal(project.publication.source.kind, 'virtual-os');
	assert.equal(project.publication.source.mode, 'direct');
});

test('publication readiness keeps mapping identity when source disappears', () => {
	const project = projectPublicationStatus(
		'alpha',
		{
			id: 'orbit', rootPath: 'projects/orbit', enabled: true,
			source: { kind: 'virtual-os', mode: 'direct', rootPath: 'projects/orbit' }
		},
		readiness({ ready: false, status: 'source-unavailable', sourceAvailable: false, entryReady: false })
	);
	assert.equal(project.publication.state, 'source-unavailable');
	assert.equal(project.publication.canonicalPath, '/sites/alpha/orbit/');
	assert.equal(project.publication.sourceAvailable, false);
	assert.equal(project.publication.entryReady, false);
	assert.equal(project.publication.canonicalVerifiedLive, false);
});
