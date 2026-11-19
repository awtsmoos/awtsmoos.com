// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudTopLayout.test.mjs
 * @description Proves the round-3 top layout: one tidy column per corner, no overlaps at phone portrait aspect.
 * The Awtsmoos gives the badge, shell, quest, map, dock, and rail each one measured shore;
 * Awtsmoos.com lets the stylesheet text and the arithmetic agree before any frame is trusted.
 * Covers: top-left badge/shell stack, collapsed rail legibility, right-column stack
 * (minimap / dock / rail), bottom-centre Controls toggle, and the 540x1200 disjointness plan.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { rectanglesIntersect } from '../../ui/MobileHudCompositionGeometry.js';

const GAME_ROOT = new URL('../../../../..', import.meta.url);
const railFragment = readFileSync(new URL('styles/source/fragments/mitzvah-world-game-rail-001.css', GAME_ROOT), 'utf8');
const directFragment = readFileSync(new URL('styles/source/fragments/mitzvah-world-direct-layout-001.css', GAME_ROOT), 'utf8');
const directSegment = readFileSync(new URL('styles/source/fragments/mitzvah-world-direct-layout-001-segment-002.css', GAME_ROOT), 'utf8');
const dockFragment = readFileSync(new URL('styles/creative-dock/mitzvah-world-creative-dock-layout.css', GAME_ROOT), 'utf8');
const mobileRailCss = readFileSync(new URL('../../ui/styles/mobile-hud/mobile-hud-rail.css', import.meta.url), 'utf8');

test('HUD shell owns the second top-left row and its toggle sits in-flow at the left', () => {
	assert.match(railFragment, /\.Awtsmoos-player-hud-shell \{[^}]*top: calc\(var\(--mw-safe-top\) \+ 44px\)/s);
	assert.match(railFragment, /\.Awtsmoos-player-hud-shell \{[^}]*display: flex;/s);
	assert.match(railFragment, /\.Awtsmoos-player-hud-shell > \[data-retract-toggle\] \{[^}]*position: static;/s);
});

test('collapsed rail keeps the mode button visible and hides only secondary actions', () => {
	assert.match(railFragment, /\.Awtsmoos-game-rail\[data-collapsed="true"\] > \[data-rail-secondary\] \{[^}]*display: none;/s);
	assert.doesNotMatch(railFragment, /\[data-collapsed="true"\] > :not\(\[data-rail-collapse\]\)/);
	assert.match(mobileRailCss, /\.Awtsmoos-game-rail\[data-collapsed="true"\] \{[^}]*grid-template-columns: repeat\(2, 44px\);/s);
});

test('portrait rail leaves the top-right corner and joins the right column below the dock', () => {
	assert.match(railFragment, /@media \(max-width: 900px\) and \(orientation: portrait\) \{[^}]*\.Awtsmoos-game-rail-host \{[^}]*top: calc\(var\(--mw-safe-top\) \+ 204px\)/s);
	assert.match(railFragment, /\.Awtsmoos-game-rail-host \{[^}]*top: calc\(var\(--mw-safe-top\) \+ 204px\);[^}]*transform: none;/s);
	assert.match(mobileRailCss, /\[data-mobile-hud-zone="rail"\] \{[^}]*top: calc\(var\(--mh-safe-top\) \+ 204px\);/s);
});

test('portrait creative dock sits below the minimap instead of sharing its corner', () => {
	assert.match(dockFragment, /@media \(max-width: 900px\) and \(orientation: portrait\) \{[^}]*\.Awtsmoos-creative-dock \{[^}]*top: calc\(var\(--mw-dock-top, max\(12px, calc\(env\(safe-area-inset-top, 0px\) \+ 8px\)\)\) \+ 136px\);/s);
});

test('Controls toggle moves to bottom-centre and its collapse keeps the toggle visible', () => {
	assert.match(directSegment, /#mobileControls > \[data-retract-toggle\] \{[^}]*left: 50%;[^}]*bottom: calc\(var\(--mw-safe-bottom\) \+ 184px\);[^}]*transform: translateX\(-50%\);/s);
	assert.match(directFragment, /#mobileControls\[data-collapsed="true"\] > :not\(\[data-retract-toggle\]\) \{[^}]*display: none;/s);
});

test('540 by 1200 portrait slots are pairwise disjoint', () => {
	const rects = {
		// Left column: badge, HUD shell, quest card.
		badge: { height: 27, width: 101, x: 8, y: 8 },
		hudShell: { height: 48, width: 56, x: 12, y: 56 },
		quest: { height: 96, width: 220, x: 20, y: 112 },
		// Right column: minimap, creative dock, game rail.
		minimap: { height: 124, width: 112, x: 420, y: 8 },
		dock: { height: 48, width: 48, x: 480, y: 148 },
		rail: { height: 56, width: 108, x: 420, y: 216 },
		// Bottom row: joystick, Controls toggle, JUMP.
		joy: { height: 128, width: 128, x: 24, y: 1046 },
		controlsToggle: { height: 48, width: 99, x: 220, y: 954 },
		jump: { height: 76, width: 76, x: 440, y: 1108 }
	};
	const names = Object.keys(rects);
	for (let first = 0; first < names.length; first += 1) {
		for (let second = first + 1; second < names.length; second += 1) {
			assert.equal(
				rectanglesIntersect(rects[names[first]], rects[names[second]]),
				false,
				`${names[first]} overlaps ${names[second]}`
			);
		}
	}
	for (const [name, rect] of Object.entries(rects)) {
		assert.ok(rect.x >= 0 && rect.y >= 0, `${name} starts off-viewport`);
		assert.ok(rect.x + rect.width <= 540, `${name} exceeds viewport width`);
		assert.ok(rect.y + rect.height <= 1200, `${name} exceeds viewport height`);
	}
	// Touch floor applies to the interactive controls, not to display panels
	// (badge, quest card, minimap panel).
	for (const name of ['hudShell', 'dock', 'rail', 'joy', 'controlsToggle', 'jump']) {
		const rect = rects[name];
		assert.ok(rect.width >= 44 && rect.height >= 44, `${name} is below the 44px touch floor`);
	}
});
