//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PublicSites
 * @description
 * The Awtsmoos reveals only creations that are truly public while Awtsmoos.com keeps every private workshop field concealed;
 * these tests prove readiness, bounded output, canonical Remix lineage, and an exact presentation-only contract.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	MAX_PUBLIC_SITES,
	publicSiteRecord,
	publicSitesFromState
} = require('../publicSites.js');

function publicFile() {
	return {
		type: 'file',
		visibility: 'public',
		size: 1
	};
}

function entriesFor(...paths) {
	return Object.fromEntries(paths.map(path => [path, publicFile()]));
}

function site(id, overrides = {}) {
	return {
		id,
		title: `Site ${id}`,
		rootPath: `projects/demo/public/${id}`,
		enabled: true,
		primary: false,
		source: { type: 'drive' },
		...overrides
	};
}

function siteRegistry(...sites) {
	return Object.fromEntries(sites.map(item => [item.id, item]));
}

test('ready enabled Sites become exact public DTOs only', () => {
	const bakery = site('bakery');
	const state = {
		sites: siteRegistry(bakery),
		entries: entriesFor(`${bakery.rootPath}/index.html`)
	};
	const [record] = publicSitesFromState('maker', state);
	assert.deepEqual(Object.keys(record).sort(), ['id', 'publicUrl', 'remixUrl', 'title']);
	assert.deepEqual(record, {
		id: 'bakery',
		title: 'Site bakery',
		publicUrl: '/sites/maker/bakery/',
		remixUrl: '/drive/?remix=https%3A%2F%2Fawtsmoos.com%2Fsites%2Fmaker%2Fbakery%2F'
	});
});

test('draft, disabled, and private-index Sites never enter the storefront', () => {
	const ready = site('ready');
	const disabled = site('disabled', { enabled: false });
	const missingIndex = site('missing-index');
	const privateIndex = site('private-index');
	const state = {
		sites: siteRegistry(ready, disabled, missingIndex, privateIndex),
		entries: {
			...entriesFor(`${ready.rootPath}/index.html`, `${disabled.rootPath}/index.html`),
			[`${privateIndex.rootPath}/index.html`]: {
				...publicFile(),
				visibility: 'private'
			}
		}
	};
	assert.deepEqual(publicSitesFromState('maker', state).map(record => record.id), ['ready']);
});

test('public records never spread Drive management fields', () => {
	const record = publicSiteRecord('maker', site('safe', {
		rootPath: 'private/root',
		projectId: 'secret-project',
		customDomains: ['hidden.example'],
		deployment: { id: 'internal' }
	}));
	const serialized = JSON.stringify(record);
	for (const forbidden of ['rootPath', 'secret-project', 'hidden.example', 'deployment', 'private/root']) {
		assert.equal(serialized.includes(forbidden), false);
	}
});

test('storefront is bounded and URL segments are encoded', () => {
	const sites = Array.from({ length: MAX_PUBLIC_SITES + 5 }, (_, index) => site(`s${index}`));
	const entries = entriesFor(...sites.map(item => `${item.rootPath}/index.html`));
	assert.equal(publicSitesFromState('maker', { sites: siteRegistry(...sites), entries }).length, MAX_PUBLIC_SITES);
	const encoded = publicSiteRecord('a/b', site('x y'));
	assert.equal(encoded.publicUrl, '/sites/a%2Fb/x%20y/');
});
