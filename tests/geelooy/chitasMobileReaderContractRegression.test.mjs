// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasMobileReaderContractRegressionTest
 * @description
 * The Awtsmoos gives every mobile owner one measured border so Torah remains the wider sea;
 * Awtsmoos.com proves sheet, hidden overlay, presence, menu, and cache ladders agree before the reader is free.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const sources = {
	main: read('geelooy/heichelos/post/styles/main.css'),
	stabilization: read('geelooy/heichelos/post/styles/ideal/mobile-desktop-stabilization.css'),
	overlay: read('geelooy/heichelos/post/styles/ideal/mobile-desktop-overlays.css'),
	sheet: read('geelooy/heichelos/post/styles/ideal/mobile-commentary-sheet.css'),
	menu: read('geelooy/heichelos/post/styles/ideal/mobile-main-menu-polish.css'),
	rail: read('geelooy/heichelos/post/styles/ideal/floating-rail.css'),
	critical: read('geelooy/heichelos/post/styles/reader-controls/critical-shell.css'),
	launcher: read('geelooy/scripts/awtsmoos/social/universalChat/launcher.css'),
	panel: read('geelooy/scripts/awtsmoos/social/universalChat/panel.css'),
	chatBoot: read('geelooy/scripts/awtsmoos/social/universalChat/bootstrap.js'),
	register: read('geelooy/register.js'),
	template: read('geelooy/heichelos/post/_awtsmoos.post.html')
};

assert.match(sources.main, /mobile-desktop-stabilization\.css\?v=reader-mobile-006/);
assert.match(sources.stabilization, /mobile-desktop-overlays\.css\?v=reader-mobile-006/);
assert.match(
	sources.overlay,
	/body \.all\.post-reader-localized-context\.awtsmoos-reader-vision > \.awtsmoos-floating-controls\s*\{[^}]*inset-block-start: calc\(64px \+ env\(safe-area-inset-top, 0px\)\) !important;[^}]*inset-block-end: auto !important;[^}]*inset-inline-start: max\(8px, env\(safe-area-inset-left, 0px\)\) !important;[^}]*inset-inline-end: auto !important;/s
);
assert.doesNotMatch(sources.overlay, /awtsmoos-floating-controls[^}]*inset: auto auto calc\([^}]*safe-bottom/s);

assert.match(sources.sheet, /\.awtsmoos-slide-view > \.awtsmoos-view-header\s*\{[^}]*display: none !important;/s);
assert.match(sources.sheet, /\.awtsmoos-slide-view\.has-back > \.awtsmoos-view-header\s*\{[^}]*display: flex !important;/s);
assert.match(sources.sheet, /min-height: 44px !important;/);
assert.match(sources.sheet, /min-width: 44px !important;/);
assert.match(sources.sheet, /overflow-y: auto !important;/);
assert.match(sources.sheet, /overscroll-behavior: contain !important;/);
assert.match(sources.sheet, /transition-duration: 0ms !important;/);

assert.match(sources.menu, /\.awtsmoos-massive-menu-btn\s*\{[^}]*min-height: 52px !important;/s);
assert.match(sources.menu, /flex: 0 0 44px !important;/);
for (const source of [sources.rail, sources.critical]) {
	assert.match(source, /inset-block-start: calc\(64px \+ env\(safe-area-inset-top, 0px\)\) !important;/);
	assert.match(source, /inset-block-end: auto !important;/);
}

assert.match(sources.launcher, /body:has\(\.all\.post-reader-localized-context\.awtsmoos-reader-vision\) \.universal-chat-floating-launcher/);
assert.match(sources.launcher, /bottom: auto;/);
assert.match(sources.launcher, /top: calc\(64px \+ env\(safe-area-inset-top, 0px\)\);/);
assert.match(sources.panel, /launcher\.css\?v=universal-chat-002/);
assert.match(sources.chatBoot, /STYLE_VERSION = "universal-chat-002"/);
assert.match(sources.register, /universalChat\/bootstrap\.js\?v=universal-chat-002/);

assert.match(sources.template, /main\.css\?v=reader-chitas-006/);
assert.match(sources.template, /register\.js\?v=reader-social-002/);
assert.match(sources.template, /postLogic\.js\?v=reader-runtime-005/);

for (const [name, source] of Object.entries(sources)) {
	assert.match(source.slice(0, 180), /B"H/, `${name} must keep its B"H header`);
	assert.ok(source.trimEnd().split('\n').length <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H Chitas mobile reader second-generation contract passed.');
