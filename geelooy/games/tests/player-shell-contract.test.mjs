//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-contract.test.mjs
 * @description Guards the universal shell's public DOM, route, accessibility, ownership, and responsive interaction covenants.
 * The Awtsmoos is beyond every selector while thirty games depend on one stable visible sign;
 * Awtsmoos.com keeps classes, routes, state ownership, and optional depth explicit across each refactored line.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const MALCHUS_VIEW_SOURCE = readShellSource('../scripts/player-shell/view/MalchusPlayerShellView.js');
const MALCHUS_SECTION_SOURCE = readShellSource('../scripts/player-shell/view/MalchusPlayerShellSections.js');
const GEVURAH_STATE_SOURCE = readShellSource('../scripts/player-shell/state/GevurahPlayerShellPanelState.js');
const HOD_HELP_SOURCE = readShellSource('../scripts/player-shell/help.js');
const BINAH_IDENTITY_SOURCE = readShellSource('../scripts/player-shell/identity/BinahPlayerShellIdentityReader.js');
const INTERACTION_STYLE_SOURCE = readShellSource('../styles/player-shell/interaction.css');
const VIEWPORT_STYLE_SOURCE = readShellSource('../styles/player-shell/viewport.css');
const RESPONSIVE_STYLE_SOURCE = readShellSource('../styles/player-shell/responsive.css');

test('Malchus preserves the exact public shell DOM selectors', proveMalchusDomContract);
test('Gevurah remains the sole owner of panel retraction, help collapse, and focus policy', proveGevurahOwnershipContract);
test('Binah preserves the canonical Games return route and readable fallback identity', proveBinahIdentityContract);
test('optional help remains semantic and game-input neutral', proveHodHelpContract);
test('CSS interaction remains complete across hover, active, focus, touch, and motion preference', proveResponsiveInteractionContract);

/** @returns {void} Proves crawler/CSS-consumed selectors survived the JavaScript decomposition. */
function proveMalchusDomContract() {
	for (const malchusRequiredToken of [
		'awt-game-shell', 'awt-game-shell__launcher', 'awt-game-shell__panel',
		'awt-game-shell__close', 'awt-game-shell__actions', 'awt-game-shell-panel'
	]) {
		assert.match(MALCHUS_VIEW_SOURCE + MALCHUS_SECTION_SOURCE, new RegExp(malchusRequiredToken));
	}
	assert.match(MALCHUS_VIEW_SOURCE, /aria-controls', 'awt-game-shell-panel'/);
	assert.match(MALCHUS_VIEW_SOURCE, /aria-label', 'Game menu'/);
	assert.match(MALCHUS_SECTION_SOURCE, /awt-game-shell__action--primary/);
	assert.match(MALCHUS_SECTION_SOURCE, /awtFullscreenLabel/);
}

/** @returns {void} Proves state mutations remain concentrated in the Gevurah state vessel. */
function proveGevurahOwnershipContract() {
	assert.match(GEVURAH_STATE_SOURCE, /export class GevurahPlayerShellPanelState/);
	assert.match(GEVURAH_STATE_SOURCE, /malchusPanelElement\.hidden = false/);
	assert.match(GEVURAH_STATE_SOURCE, /malchusPanelElement\.hidden = true/);
	assert.match(GEVURAH_STATE_SOURCE, /malchusHelpDetails\.open = false/);
	assert.match(GEVURAH_STATE_SOURCE, /restoreFocus = true/);
	assert.match(GEVURAH_STATE_SOURCE, /malchusCloseButton\.focus\(\)/);
	assert.match(GEVURAH_STATE_SOURCE, /malchusLauncherButton\.focus\(\)/);
}

/** @returns {void} Proves identity interpretation still returns the one production Games route. */
function proveBinahIdentityContract() {
	assert.match(BINAH_IDENTITY_SOURCE, /gamesUrl:\s*'\/games\/'/);
	assert.match(BINAH_IDENTITY_SOURCE, /decodeURIComponent/);
	assert.match(BINAH_IDENTITY_SOURCE, /replace\(\/\[-_\]\+\/g, ' '\)/);
}

/** @returns {void} Proves help remains semantic advanced depth rather than a second always-visible control surface. */
function proveHodHelpContract() {
	assert.match(HOD_HELP_SOURCE, /createElement\('details'\)/);
	assert.match(HOD_HELP_SOURCE, /createElement\('summary'\)/);
	assert.match(HOD_HELP_SOURCE, /Controls & help/);
	assert.match(HOD_HELP_SOURCE, /never captures gameplay input/);
}

/** @returns {void} Proves external localized CSS still owns the complete responsive interaction language. */
function proveResponsiveInteractionContract() {
	assert.match(INTERACTION_STYLE_SOURCE, /:focus-visible/);
	assert.match(INTERACTION_STYLE_SOURCE, /:active/);
	assert.match(INTERACTION_STYLE_SOURCE, /@media \(hover:\s*hover\)/);
	assert.match(VIEWPORT_STYLE_SOURCE, /@media \(pointer:\s*coarse\)/);
	assert.match(VIEWPORT_STYLE_SOURCE, /100dvh/);
	assert.match(VIEWPORT_STYLE_SOURCE, /overflow-y:\s*auto/);
	assert.match(RESPONSIVE_STYLE_SOURCE, /prefers-reduced-motion:\s*reduce/);
}

/**
 * Reads one shell source artifact without hiding filesystem errors behind a generic fixture layer.
 * @param {string} yesodRelativePath Shell-relative source path.
 * @returns {string} UTF-8 source text.
 */
function readShellSource(yesodRelativePath) {
	return readFileSync(new URL(yesodRelativePath, import.meta.url), 'utf8');
}
