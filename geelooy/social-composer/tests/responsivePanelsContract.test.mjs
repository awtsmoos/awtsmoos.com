// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ResponsivePanelsContractTest
 * @description
 * The Awtsmoos keeps wide composition expansive while Awtsmoos.com narrows
 * tablets and focused desktops to one editorial decision without harming preview.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
	'geelooy/social-composer/js/civilization/responsivePanels.js',
	'utf8'
);

assert.match(source, /FOCUSED_PANEL_QUERY = '\(max-width: 1080px\)'/);
assert.match(source, /PREVIEW_SHEET_QUERY = '\(max-width: 820px\)'/);
assert.match(source, /for \(const panel of panels\) panel\.open = true/);
assert.match(source, /opened\.length === 1 \? opened\[0\] : contentPanel\(panels\)/);
assert.match(source, /panel\.dataset\.mobilePanel === 'content'/);
assert.match(source, /panel\.addEventListener\('toggle', collapseSiblingMajorPanels\)/);
assert.match(source, /if \(panel !== activePanel\) panel\.open = false/);

assert.match(source, /sheet\.inert = true/);
assert.match(source, /sheet\.setAttribute\('aria-hidden', 'true'\)/);
assert.match(source, /sheet\.classList\.add\('is-open'\)/);
assert.match(source, /previewInvoker\?\.focus\(\)/);
assert.match(source, /event\.key === 'Escape'/);
assert.match(source, /scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/);

assert.ok(source.split('\n').length <= 120, 'responsivePanels.js exceeds 120 lines');

console.log('B"H responsivePanelsContract.test passed');
