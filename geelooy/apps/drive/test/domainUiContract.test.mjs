//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves the Drive domain surface stays modular, server-attested, and
 * mobile-safe by construction. Awtsmoos.com rejects hidden HTML injection, fake DNS
 * values, contradictory routing instructions, or an unmounted panel before browser proof.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ROOT = new URL('../js/', import.meta.url);
const FILES = Object.freeze([
	'domainApi.js',
	'domainPanel.js',
	'domainDnsView.js',
	'domainRecordsView.js',
	'domainControls.js',
	'domainOperations.js',
	'projectWorkspace.js'
]);

test('domain UI production modules obey source and safe-DOM law', async () => {
	for (const name of FILES) {
		const source = await sourceText(name);
		assert.ok(source.split(/\r?\n/).length <= 120, `${name} exceeds 120 lines`);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /\.innerHTML\s*=/);
		assert.doesNotMatch(source, /verificationToken/);
	}
});

test('domain panel exposes real DNS modes and truthfully disables Awtsmoos NS', async () => {
	const source = await sourceText('domainPanel.js');
	assert.match(source, /external-dns/);
	assert.match(source, /custom-nameservers/);
	assert.match(source, /Awtsmoos nameservers — not deployed/);
	assert.match(source, /awtsmoos-nameservers[^\n]+true/);
	assert.match(source, /Publish a named site first/);
});

test('domain card keeps readiness states distinct from DNS instructions', async () => {
	const source = await sourceText('domainRecordsView.js');
	for (const state of ['Ownership', 'Delegation', 'Routing', 'TLS']) {
		assert.match(source, new RegExp(state));
	}
	assert.match(source, /renderDomainDnsPlan/);
	assert.match(source, /plan\?\.routing\?\.canActivate/);
});

test('DNS view renders server plans as alternative routing choices', async () => {
	const source = await sourceText('domainDnsView.js');
	assert.match(source, /plan\.ownership\?\.record/);
	assert.match(source, /plan\.routing\?\.options\?\.direct/);
	assert.match(source, /plan\.routing\?\.options\?\.cname/);
	assert.match(source, /Option A · direct A \/ AAAA/);
	assert.match(source, /Option B · CNAME/);
	assert.match(source, /do not install both for the same hostname/);
	assert.match(source, /plan\.routing\?\.blockers/);
	assert.match(source, /awtsmoosNameservers\?\.available === false/);
});

test('workspace mounts the domain panel after existing project and site surfaces', async () => {
	const source = await sourceText('projectWorkspace.js');
	assert.match(source, /createProjectStages/);
	assert.match(source, /createPublisher/);
	assert.match(source, /createSiteList/);
	assert.match(source, /createDomainPanel/);
	assert.match(source, /bindDomainPanel/);
	assert.ok(source.indexOf('createSiteList(sites)') < source.indexOf('domains.root'));
});

async function sourceText(name) {
	return readFile(new URL(name, ROOT), 'utf8');
}
