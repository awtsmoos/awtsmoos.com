// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelMobileUxRepairContractTest
 * @description
 * The Awtsmoos gives a phone readable ink, room beneath the floating gate, and one self-contained spark in the browser crown;
 * Awtsmoos.com proves contrast, safe-area clearance, fresh CSS, touch reach, favicon silence, and accessibility as final gown.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const templatePath = 'geelooy/heichelos/heichel/_awtsmoos.heichel.html';
const indexPath = 'geelooy/style/heichelos/heichel/index.css';
const contrastPath = 'geelooy/style/heichelos/heichel/future/mobile-contrast.css';
const ergonomicsPath = 'geelooy/style/heichelos/heichel/future/mobile-ergonomics.css';
const accessibilityPath = 'geelooy/style/heichelos/heichel/future/accessibility.css';
const template = readFileSync(templatePath, 'utf8');
const index = readFileSync(indexPath, 'utf8');
const contrast = readFileSync(contrastPath, 'utf8');
const ergonomics = readFileSync(ergonomicsPath, 'utf8');
const accessibility = readFileSync(accessibilityPath, 'utf8');
const contrastImport = '@import "./future/mobile-contrast.css";';
const ergonomicsImport = '@import "./future/mobile-ergonomics.css";';
const accessibilityImport = '@import "./future/accessibility.css";';

assert.ok(index.includes(contrastImport), 'mobile contrast layer must load');
assert.ok(index.includes(ergonomicsImport), 'mobile ergonomics layer must load');
assert.ok(index.indexOf(contrastImport) < index.indexOf(ergonomicsImport), 'contrast should precede geometry');
assert.ok(index.indexOf(ergonomicsImport) < index.indexOf(accessibilityImport), 'accessibility must load last');
assert.equal(index.trim().endsWith(accessibilityImport), true, 'accessibility import must own final Heichel cascade');
assert.match(template, /index\.css\?v=ikar-mobile-ux-001/, 'Heichel document must cache-bust the mobile UX index');
assert.match(template, /rel="icon" href="data:image\/svg\+xml/, 'Heichel document must own a network-free favicon');

for (const selector of ['living-path-search-stack', 'living-path-result-status', 'filter-chip']) {
	assert.ok(contrast.includes(selector), `contrast layer must own ${selector}`);
}
for (const token of ['safe-area-inset-bottom', '--heichel-mobile-dock-clearance', '7.25rem', 'geelooy-main-stage']) {
	assert.ok(ergonomics.includes(token), `ergonomics layer must include ${token}`);
}
assert.match(ergonomics, /min-block-size:\s*46px\s*!important/);
assert.match(ergonomics, /max-width:\s*28rem/);
assert.match(ergonomics, /#heichel-main-title/);
assert.match(accessibility, /prefers-reduced-motion:\s*reduce/);
assert.equal(/Wikisource|wikisource/.test(template + index + contrast + ergonomics), false, 'provider branding must remain absent');

for (const [filePath, source] of [[templatePath, template], [indexPath, index], [contrastPath, contrast], [ergonomicsPath, ergonomics]]) {
	assert.ok(source.split('\n').length - 1 <= 120, `${filePath} exceeds the 120-line covenant`);
}
console.log('B"H Heichel mobile UX repair contract passed.');
