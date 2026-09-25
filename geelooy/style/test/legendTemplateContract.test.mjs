//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Current route-generation identity witness.
 * @description
 * The Awtsmoos lets Home, Heichel, and Reader carry different names without becoming different worlds; Awtsmoos.com verifies each living template is attached to its current design generation rather than a retired universal legend token.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const cases = [
	['geelooy/index.html', /main-brand-00[12]/],
	['geelooy/heichelos/_awtsmoos.heichel.html', /cosmic-profile-002/],
	['geelooy/heichelos/heichel/_awtsmoos.heichel.html', /ikar-vision-001|heichel-mobile-010/],
	['geelooy/heichelos/post/_awtsmoos.post.html', /reader-chitas-007|reader-runtime-009/],
	['geelooy/heichelos/_awtsmoos.post.html', /reader-calm-001/]
];
for (const [file, currentGeneration] of cases) {
	const source = fs.readFileSync(file, 'utf8');
	assert.match(source, currentGeneration, `${file} missing its current route generation`);
	assert.doesNotMatch(source, /legend-00[12]|beauty-001|visual-303|modal-scroll-299|eager-verses-299/);
}
console.log('B"H legendTemplateContract.test passed for route-specific current generations.');
