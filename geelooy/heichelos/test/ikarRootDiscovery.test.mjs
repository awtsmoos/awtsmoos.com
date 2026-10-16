//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const createShellRenderer = require('../routes/heichel/shell.js');
const {
	getIkarRootDiscovery
} = require('../routes/heichel/ikarRootDiscovery.js');

function mockTemplateRenderer(capture) {
	return async function render(path, vars = {}) {
		if (path.endsWith('/semantic/fallback.html')) {
			capture.discovery = vars.discovery;
			capture.semantic = vars.semantic;
			return '<div data-semantic-fallback></div>';
		}
		if (path.endsWith('/semantic/head.html')) return '<title>Ikar</title>';
		if (path.endsWith('/_awtsmoos.heichel.html')) {
			return JSON.stringify({
				links: vars.discovery?.links?.map(link => link.path) || []
			});
		}
		return '<div></div>';
	};
}

test('canonical Ikar root discovery has nine unique permanent series doors', () => {
	const discovery = getIkarRootDiscovery();
	assert.equal(discovery.links.length, 9);
	assert.equal(new Set(discovery.links.map(link => link.path)).size, 9);
	assert.ok(discovery.links.every(link => link.kind === 'series'));
	assert.ok(discovery.links.every(link => link.path.startsWith('/heichelos/ikar/series/')));
	assert.ok(discovery.links.some(link => link.path.endsWith('/daily-chitas')));
	assert.ok(discovery.links.length >= 8, 'server search threshold must remain satisfied');
});

test('canonical Ikar root renders without any public API request', async () => {
	let fetchCalls = 0;
	const capture = {};
	const shell = createShellRenderer({
		async fetchAwtsmoos() {
			fetchCalls += 1;
			throw new Error('Ikar root must not reach the network');
		},
		$ga: mockTemplateRenderer(capture)
	});
	const html = await shell.renderHeichelShell('ikar', 'root');
	const rendered = JSON.parse(html);
	assert.equal(fetchCalls, 0);
	assert.equal(capture.discovery.links.length, 9);
	assert.equal(rendered.links.length, 9);
	assert.ok(capture.semantic, 'semantic model should still be produced');
});

test('non-root Heichel still retains live public discovery', async () => {
	let fetchCalls = 0;
	const shell = createShellRenderer({
		async fetchAwtsmoos(path) {
			fetchCalls += 1;
			if (path.includes('/subSeries')) return [];
			if (path.includes('/posts/details')) return [];
			return { name: 'Other Heichel' };
		},
		$ga: mockTemplateRenderer({})
	});
	await shell.renderHeichelShell('other-zero-api-proof', 'root');
	assert.ok(fetchCalls >= 3, 'non-root shell should retain live metadata and discovery');
});
