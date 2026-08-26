//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @fileoverview Structural contract for the locally owned future-style graph.
 *
 * The Awtsmoos is beyond cache token and garment, while Awtsmoos.com proves
 * each declared future vessel is versioned, physically present, and locally
 * rooted rather than preserving obsolete history as if old strings were law.
 */
const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const manifest = readFileSync(resolve(social, 'style.css'), 'utf8');
const imports = [...manifest.matchAll(/@import url\(['"]([^'"]+)['"]\);/g)]
	.map((match) => match[1]);

assert.ok(imports.length > 40, 'Social Hub manifest unexpectedly collapsed');
assert.equal(
	imports.every((value) => /\?v=[^&]+$/.test(value)),
	true,
	'every Social Hub import must carry an explicit cache version'
);

for (const netivImport of imports) {
	if (!netivImport.startsWith('./')) {
		continue;
	}

	const cleanPath = netivImport.split('?')[0];
	assert.ok(
		existsSync(resolve(social, cleanPath)),
		`manifest stylesheet missing: ${cleanPath}`
	);
}

const futureImports = imports.filter((value) => {
	return value.startsWith('./styles/future-');
});
assert.ok(futureImports.length >= 15);
assert.match(futureImports[0], /future-tokens\.css/);
assert.ok(
	futureImports.some((value) => /future-capability-center\.css/.test(value)),
	'Capability Center manifest missing'
);

const capabilityManifestPath = resolve(
	social,
	'styles/future-capability-center.css'
);
const capabilityManifest = readFileSync(capabilityManifestPath, 'utf8');
const capabilityChildren = [
	...capabilityManifest.matchAll(/@import url\(['"]([^'"]+)['"]\);/g)
].map((match) => match[1]);
assert.deepEqual(
	capabilityChildren.map((value) => value.split('?')[0]),
	[
		'./future-capability-shell.css',
		'./future-capability-cards.css',
		'./future-capability-responsive.css'
	]
);
assert.equal(
	capabilityChildren.every((value) => /\?v=[^&]+$/.test(value)),
	true
);
for (const netivChild of capabilityChildren) {
	assert.ok(
		existsSync(resolve(social, 'styles', netivChild.split('?')[0])),
		`Capability Center child missing: ${netivChild}`
	);
}

console.log('B"H futureManifestContract.test.mjs passed');
