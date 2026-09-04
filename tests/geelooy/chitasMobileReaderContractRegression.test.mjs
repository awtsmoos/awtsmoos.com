// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasMobileReaderContractRegressionTest
 * @description
 * The Awtsmoos gives every mobile owner one measured border so Torah remains the wider sea;
 * Awtsmoos.com proves the seventh sheet and menu garment, stable rail, presence, and cache ladders agree before the reader is free.
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

assert.match(sources.main, /mobile-desktop-stabilization\.css\?v=reader-mobile-007/);
assert.match(sources.main, /mobile-main-menu-polish\.css\?v=reader-mobile-007/);
assert.match(sources.stabilization, /mobile-desktop-overlays\.css\?v=reader-mobile-006/);
assert.match(sources.stabilization, /mobile-commentary-sheet\.css\?v=reader-mobile-007/);
assert.match(sources.overlay, /inset-block-start: calc\(64px \+ env\(safe-area-inset-top, 0px\)\) !important;/);
assert.match(sources.overlay, /inset-block-end: auto !important;/);

assert.match(sources.sheet, /\.awtsmoos-slide-view > \.awtsmoos-view-header\s*\{[^}]*display: none !important;/s);
assert.match(sources.sheet, /\.awtsmoos-slide-view\.has-back > \.awtsmoos-view-header\s*\{[^}]*display: flex !important;/s);
assert.match(sources.sheet, /sidebar:has\(\.awtsmoos-slide-view\.active-view\.has-back\)[\s\S]*\.awtsmoos-current-view-title/);
assert.match(sources.sheet, /sidebar:has\(\.awtsmoos-slide-view\.active-view\.has-back\)[\s\S]*\.awtsmoos-sidebar-breadcrumbs/);
assert.match(sources.sheet, /opacity: 0 !important;/);
assert.match(sources.sheet, /pointer-events: none !important;/);
assert.match(sources.sheet, /overscroll-behavior: contain !important;/);
assert.match(sources.sheet, /transition-duration: 0ms !important;/);

assert.match(sources.menu, /display: grid !important;/);
assert.match(sources.menu, /grid-template-columns: 44px minmax\(0, 1fr\) auto !important;/);
assert.match(sources.menu, /min-height: 52px !important;/);
assert.match(sources.menu, /\.menu-icon-vessel[\s\S]*height: 44px !important;[\s\S]*width: 44px !important;/);
assert.match(sources.menu, /@media \(max-width: 520px\)[\s\S]*\.menu-portal-desc[\s\S]*display: none !important;/);

for (const source of [sources.rail, sources.critical]) {
	assert.match(source, /inset-block-start: calc\(64px \+ env\(safe-area-inset-top, 0px\)\) !important;/);
	assert.match(source, /inset-block-end: auto !important;/);
}
assert.match(sources.launcher, /body:has\(\.all\.post-reader-localized-context\.awtsmoos-reader-vision\) \.universal-chat-floating-launcher/);
assert.match(sources.panel, /launcher\.css\?v=universal-chat-002/);
assert.match(sources.chatBoot, /STYLE_VERSION = "universal-chat-002"/);
assert.match(sources.register, /universalChat\/bootstrap\.js\?v=universal-chat-002/);

assert.match(sources.template, /main\.css\?v=reader-chitas-007/);
assert.match(sources.template, /register\.js\?v=reader-social-002/);
assert.match(sources.template, /postLogic\.js\?v=reader-runtime-006/);

for (const [name, source] of Object.entries(sources)) {
	assert.match(source.slice(0, 180), /B"H/, `${name} must keep its B"H header`);
	assert.ok(source.trimEnd().split('\n').length <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H Chitas mobile reader seventh-generation contract passed.');
