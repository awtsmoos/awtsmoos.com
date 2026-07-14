// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelShellRouteContractTest
 * @description
 * Guards one canonical Horizon and one dark control owner in every Heichel.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const templates = [
	'geelooy/heichelos/_awtsmoos.heichel.html',
	'geelooy/heichelos/heichel/_awtsmoos.heichel.html'
];

for (const file of templates) {
	const html = readFileSync(file, 'utf8');
	for (const token of [
		'/scripts/awtsmoos/social/shell/boot.js',
		'/scripts/awtsmoos/social/navigation/appNavigation.js',
		'/style/geelooy-system/index.css',
		'data-heichel-page',
		'data-heichel-render-root',
		'data-heichel-boot-state',
		'geelooy-content-region',
		'🏛️'
	]) {
		assert.ok(html.includes(token), `${file} missing ${token}`);
	}
	assert.equal(html.includes('nav/header.html'), false, `${file} duplicates the canonical header`);
	assert.ok((html.match(/<script type="module"/g) || []).length >= 3);
	assert.ok(html.split('\n').length - 1 <= 120, `${file} exceeds 120 lines`);
}

const styleManifest = readFileSync('geelooy/style/heichelos/heichel/index.css', 'utf8');
const controls = readFileSync('geelooy/style/heichelos/heichel/controls.css', 'utf8');
assert.match(styleManifest, /controls\.css\?v=ikar-speed-001/);
assert.match(controls, /body\.heichel-os-document/);
assert.match(controls, /background:\s*linear-gradient/);
assert.match(controls, /font-size:\s*max\(1rem, 16px\)/);
assert.ok(controls.split('\n').length - 1 <= 120);
console.log('B"H heichelShellRouteContract.test passed');
