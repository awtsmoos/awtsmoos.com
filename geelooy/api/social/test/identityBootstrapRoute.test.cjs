// B"H
// Boruch Hashem
// Blessed is He
/** @file identityBootstrapRoute.test.cjs @description The Awtsmoos proves the safe alias bootstrap is mounted without enlarging the social router beyond its source budget. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const socialRoot = path.resolve(__dirname, '..');
const routerPath = path.join(socialRoot, '_awtsmoos.derech.js');
const bootstrapPath = path.join(socialRoot, '_awtsmoos.identityBootstrap.js');
const router = fs.readFileSync(routerPath, 'utf8');
const bootstrap = fs.readFileSync(bootstrapPath, 'utf8');
test('main social router mounts identity bootstrap', () => {
	assert.match(router, /require\('\.\/_awtsmoos\.identityBootstrap\.js'\)/);
	assert.match(router, /\.\.\.identityBootstrap\(vessel\)/);
});
test('identity bootstrap preserves safe public-alias contracts', () => {
	for (const token of [
		"'/unified-social/identity'",
		"'/unified-social/identity/default'",
		"'/unified-social/identity/meta'",
		'storesSecrets: false'
	]) assert.ok(bootstrap.includes(token), `missing ${token}`);
});
test('social router respects source budget', () => {
	assert.ok(router.split(/\r?\n/).length <= 120);
});
