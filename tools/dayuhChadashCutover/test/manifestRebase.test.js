// B"H
// Boruch Hashem
// Blessed is He

/** @file manifestRebase.test.js @description Proves exact RAG root restoration. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const {
	rebaseManifests,
	restoreManifests,
	snapshotManifests
} = require('../manifestRebase.js');
const { cleanupFixture, createFixture } = require('./fixture.js');

test('moved manifests rebase and restore exact original text', () => {
	const fixture = createFixture();
	const snapshots = snapshotManifests(fixture.policy);
	fs.mkdirSync(fixture.policy.aiDestination, { recursive: true });
	fs.renameSync(fixture.policy.aiSource, fixture.policy.aiDestination);
	const reports = rebaseManifests(fixture.policy, snapshots);
	for (const report of reports) {
		const text = fs.readFileSync(report.destinationFile, 'utf8');
		assert(text.includes(fixture.policy.aiDestination));
		assert(!text.includes(fixture.policy.aiSource));
		assert(report.replacements >= 2);
	}
	restoreManifests(reports);
	for (const report of reports) {
		assert.equal(fs.readFileSync(report.destinationFile, 'utf8'), report.beforeText);
	}
	cleanupFixture(fixture);
});
