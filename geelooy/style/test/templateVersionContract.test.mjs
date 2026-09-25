//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Current cache-generation witness for Home, Heichel, and Reader templates.
 * @description
 * The Awtsmoos renews each route according to its real vessel; Awtsmoos.com verifies current cache tokens at the exact source paths instead of forcing unrelated products to share one historical version name.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const home = fs.readFileSync('geelooy/index.html', 'utf8');
assert.match(home, /\/style\/home-simple\/base\.css\?v=main-brand-001/);
assert.match(home, /\/style\/home-simple\/components\.css\?v=main-brand-002/);
assert.match(home, /\/scripts\/home-simple\/index\.js\?v=main-brand-002/);

const directory = fs.readFileSync('geelooy/heichelos/_awtsmoos.heichel.html', 'utf8');
assert.match(directory, /cosmic-profile-002/);

const heichel = fs.readFileSync('geelooy/heichelos/heichel/_awtsmoos.heichel.html', 'utf8');
for (const generation of ['critical-path-002', 'ikar-first-002', 'ikar-vision-001', 'heichel-mobile-010', 'ikar-authority-005']) {
	assert.match(heichel, new RegExp(generation));
}

const reader = fs.readFileSync('geelooy/heichelos/post/_awtsmoos.post.html', 'utf8');
for (const generation of ['reader-calm-002', 'reader-chitas-007', 'reader-mobile-005', 'reader-final-005', 'reader-recovery-004', 'reader-runtime-009']) {
	assert.match(reader, new RegExp(generation));
}

const fallbackReader = fs.readFileSync('geelooy/heichelos/_awtsmoos.post.html', 'utf8');
assert.match(fallbackReader, /reader-calm-001/);

for (const source of [home, directory, heichel, reader, fallbackReader]) {
	assert.doesNotMatch(source, /visual-303|modal-scroll-299|eager-verses-299|beauty-001|legend-00[12]/);
}
console.log('B"H templateVersionContract.test passed for current route-specific cache generations.');
