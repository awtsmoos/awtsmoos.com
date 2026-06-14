// B"H
/**
 * Contract for the global hamburger and card three-dot menu.
 * The menu must not depend on generated SVG scripts, and the card menu must
 * override old mobile bottom-sheet rules that were swallowing the card list.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const header = readFileSync('templates/nav/header.html', 'utf8');
const cardMenuCss = readFileSync('geelooy/style/heichelos/heichel/card-menu.css', 'utf8');
const grids = readFileSync('geelooy/heichelos/heichel/modules/ui/render/grids.js', 'utf8');

assert.ok(header.includes('window.awtsmoosToggleGlobalMenu'), 'global menu toggle missing');
assert.ok(header.includes('<span class="menuGlyph"'), 'literal hamburger glyph missing');
assert.ok(!header.includes('return /*svg*/'), 'hamburger must not depend on SVG template script');
assert.ok(header.includes('sidebar.classList.toggle("offscreen", !open)'), 'sidebar offscreen toggle missing');
assert.ok(grids.includes('classList.toggle("open", willOpen)'), 'card menu JS open toggle missing');
assert.ok(cardMenuCss.includes('.card-menu-spark.open {'), 'card menu open override missing');
assert.ok(cardMenuCss.includes('position: relative;'), 'card menu must remain card-anchored');
assert.ok(cardMenuCss.includes('@media (max-width: 640px)'), 'mobile card menu override missing');
assert.ok(!/\.card-menu-spark\.open\s*\{[^}]*position:\s*fixed/s.test(cardMenuCss), 'card menu must not be fixed bottom sheet');
console.log('B"H menuRuntimeContract.test passed');
