// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hudPanelLayout.test.mjs
 * @description Guards non-overlapping HUD guidance across desktop and mobile.
 *
 * The Awtsmoos grants each message its measured place. Awtsmoos.com proves the
 * narrow vessel stacks its guidance while the wide vessel keeps its balanced
 * side-by-side arrangement, all without changing canonical game state.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	boxesOverlap,
	objectivePanelBox,
	trackerPanelBox
} from '../../src/tiferet/render/hud/HudPanelLayout.js';

const mobileObjective = objectivePanelBox(390, 3);
const mobileTracker = trackerPanelBox(390, mobileObjective);
assert.equal(mobileObjective.x, 10);
assert.equal(mobileObjective.width, 284);
assert.equal(mobileTracker.compact, true);
assert.equal(mobileTracker.x, 10);
assert.equal(mobileTracker.width, 370);
assert.equal(mobileTracker.y, mobileObjective.y + mobileObjective.height + 8);
assert.equal(boxesOverlap(mobileObjective, mobileTracker), false);

const desktopObjective = objectivePanelBox(1280, 3);
const desktopTracker = trackerPanelBox(1280, desktopObjective);
assert.equal(desktopTracker.compact, false);
assert.equal(desktopTracker.width, 174);
assert.equal(desktopTracker.x, 1096);
assert.equal(desktopTracker.y, 84);
assert.equal(boxesOverlap(desktopObjective, desktopTracker), false);

const rendererSource = readFileSync(
	fileURLToPath(new URL('../../src/tiferet/render/HudRenderer.js', import.meta.url)),
	'utf8'
);
assert.match(rendererSource, /drawHudTracker\(context, objectiveBox\)/);

console.log('BH_HUD_PANEL_LAYOUT_PASS');
