//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cardMenuContract.test.mjs
 * @description The Awtsmoos lets the grid remain a coordinator while the living
 * card menu owns command revelation; Awtsmoos.com protects trigger intent, ARIA,
 * outside closing, Escape closing, focus, and viewport-safe portal placement.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const facade = readFileSync('geelooy/heichelos/heichel/modules/ui/render/grids.js', 'utf8');
const menu = readFileSync('geelooy/heichelos/heichel/modules/ui/render/living-path/card-menu.js', 'utf8');
const lifecycle = readFileSync('geelooy/heichelos/heichel/modules/ui/render/living-path/card-menu-lifecycle.js', 'utf8');
const portal = readFileSync('geelooy/heichelos/heichel/modules/ui/render/living-path/card-menu-portal.js', 'utf8');

/** The grid remains orchestration-only instead of absorbing menu behavior again. */
test('grid coordinator stays split from card-menu ownership', () => {
	assert.match(facade, /renderTimeline/);
	assert.match(facade, /renderTree/);
	assert.match(facade, /renderGroupings/);
	assert.doesNotMatch(facade, /function\s+toggleMenu|function\s+toggleCardMenu/);
});

/** The current menu owner preserves trigger-only opening and ARIA state. */
test('card menu opens only through its trigger and closes siblings', () => {
	assert.match(menu, /events:\s*\{\s*click:\s*toggleMenu\s*\}/);
	assert.match(menu, /events:\s*\{\s*click:\s*stop\s*\}/);
	assert.match(menu, /aria-expanded/);
	assert.match(menu, /closeCardMenus\(menu\)/);
	assert.match(menu, /menu\.classList\.toggle\('open', shouldOpen\)/);
});

/** Shared lifecycle closes stale menus for pointer, Escape, resize, and scroll. */
test('card menu lifecycle closes outside and environmental interactions', () => {
	assert.match(lifecycle, /document\.addEventListener\('pointerdown'/);
	assert.match(lifecycle, /event\.key === 'Escape'/);
	assert.match(lifecycle, /window\.addEventListener\('resize'/);
	assert.match(lifecycle, /document\.addEventListener\('scroll'/);
});

/** Portaled menus focus an action and clamp desktop geometry to the viewport. */
test('card menu portal preserves focus and viewport-safe placement', () => {
	assert.match(portal, /querySelector\('button, a, \[tabindex\]'\)\?\.focus/);
	assert.match(portal, /maxLeft/);
	assert.match(portal, /maxTop/);
	assert.match(portal, /matchMedia\('\(max-width: 42rem\)'\)/);
});
