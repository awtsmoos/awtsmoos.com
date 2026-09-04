// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasMobileReaderContractRegressionTest
 * @description
 * The Awtsmoos gives each mobile vessel one measured border so Torah remains the wider sea;
 * Awtsmoos.com proves the sheet, menu, rail, and final cascade agree before the reader is set free.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const sources = {
	main: read('geelooy/heichelos/post/styles/main.css'),
	sheet: read('geelooy/heichelos/post/styles/ideal/mobile-commentary-sheet.css'),
	menu: read('geelooy/heichelos/post/styles/ideal/mobile-main-menu-polish.css'),
	rail: read('geelooy/heichelos/post/styles/ideal/floating-rail.css'),
	critical: read('geelooy/heichelos/post/styles/reader-controls/critical-shell.css'),
	template: read('geelooy/heichelos/post/_awtsmoos.post.html')
};

assert.match(sources.main, /floating-rail\.css\?v=reader-mobile-005/);
assert.match(sources.main, /mobile-desktop-stabilization\.css\?v=reader-mobile-005/);
assert.match(sources.main, /mobile-main-menu-polish\.css\?v=reader-mobile-005/);
assert.match(sources.main, /translations\.css\?v=translation-reader-003/);
assert.match(sources.main, /tanach-native\.css\?v=tanach-native-003/);

assert.match(
	sources.sheet,
	/\.awtsmoos-slide-view > \.awtsmoos-view-header\s*\{[^}]*display: none !important;/s
);
assert.match(
	sources.sheet,
	/\.awtsmoos-slide-view\.has-back > \.awtsmoos-view-header\s*\{[^}]*display: flex !important;/s
);
assert.match(sources.sheet, /min-height: 44px !important;/);
assert.match(sources.sheet, /min-width: 44px !important;/);
assert.match(sources.sheet, /overflow-y: auto !important;/);
assert.match(sources.sheet, /overscroll-behavior: contain !important;/);
assert.match(sources.sheet, /\.sidebar[^\n]*hidden-comments[^\n]*awtsmoos-floating-controls/);
assert.match(sources.sheet, /transition-duration: 0ms !important;/);

assert.match(sources.menu, /\.awtsmoos-massive-menu-btn\s*\{[^}]*min-height: 52px !important;/s);
assert.match(sources.menu, /flex: 0 0 44px !important;/);
assert.match(sources.menu, /height: 44px !important;/);
assert.match(sources.menu, /width: 44px !important;/);
assert.match(sources.menu, /@media \(max-width: 520px\)[\s\S]*display: none !important;/);

for (const source of [sources.rail, sources.critical]) {
	assert.match(source, /inset-block-start: calc\(64px \+ env\(safe-area-inset-top, 0px\)\) !important;/);
	assert.match(source, /inset-block-end: auto !important;/);
}
assert.match(sources.rail, /height: 44px !important;/);
assert.match(sources.rail, /width: 44px !important;/);
assert.match(sources.rail, /transition: none !important;/);
assert.match(sources.template, /main\.css\?v=reader-chitas-005/);
assert.match(sources.template, /critical-shell\.css\?v=reader-mobile-005/);
assert.match(sources.template, /postLogic\.js\?v=reader-runtime-004/);

for (const [name, source] of Object.entries(sources)) {
	assert.match(source.slice(0, 160), /B"H/, `${name} must keep its B"H header`);
	assert.ok(source.trimEnd().split('\n').length <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H Chitas mobile reader contract regression passed.');
