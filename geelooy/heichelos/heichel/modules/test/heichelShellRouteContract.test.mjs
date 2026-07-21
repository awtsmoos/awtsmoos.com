// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelShellRouteContractTest
 * @description
 * Guards one canonical roof, one app entry, one cosmic profile, and the split
 * field/navigation control owners in both Awtsmoos.com Heichel templates.
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
		'/heichelos/heichel/app.js',
		'/heichelos/heichel/modules/cosmic/boot.js',
		'/style/geelooy-system/index.css',
		'/style/heichelos/heichel/cosmic-profile/index.css',
		'data-heichel-page',
		'data-heichel-render-root',
		'data-heichel-boot-state',
		'geelooy-content-region'
	]) {
		assert.ok(html.includes(token), `${file} missing ${token}`);
	}
	assert.equal(html.includes('nav/header.html'), false);
	assert.ok((html.match(/<script type="module"/g) || []).length >= 4);
	assert.ok(html.split('\n').length - 1 <= 120, `${file} exceeds 120 lines`);
}

const styleManifest = readFileSync(
	'geelooy/style/heichelos/heichel/index.css',
	'utf8'
);
const controlsManifest = readFileSync(
	'geelooy/style/heichelos/heichel/controls.css',
	'utf8'
);
const fields = readFileSync(
	'geelooy/style/heichelos/heichel/controls/fields.css',
	'utf8'
);
const navigation = readFileSync(
	'geelooy/style/heichelos/heichel/controls/navigation.css',
	'utf8'
);

assert.match(styleManifest, /controls\.css\?v=ikar-speed-001/);
assert.match(controlsManifest, /controls\/fields\.css/);
assert.match(controlsManifest, /controls\/navigation\.css/);
assert.match(fields, /body\.heichel-os-document/);
assert.match(fields, /background:\s*linear-gradient/);
assert.match(fields, /font-size:\s*max\(1rem, 16px\)/);
assert.match(navigation, /\.geelooy-bottom-nav/);
assert.match(navigation, /min-block-size:\s*44px/);
for (const source of [controlsManifest, fields, navigation]) {
	assert.ok(source.split('\n').length - 1 <= 120);
}
console.log('B"H heichelShellRouteContract.test passed');
