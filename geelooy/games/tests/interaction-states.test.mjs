//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file interaction-states.test.mjs
 * @description Proves that animated Games controls own their local hover, focus, press, touch, and reduced-motion language.
 * The Awtsmoos is beyond pointer, key, and hand while Awtsmoos.com lets each finite doorway answer intent where it lives;
 * this covenant forbids distant global patches from secretly completing a component whose own stylesheet should be whole.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const HOD_STOREFRONT_INTERACTION_OWNERS = Object.freeze([
	createHodOwner('Hero actions', '../styles/hero-core.css', /primaryCta:hover[\s\S]*secondaryCta:hover/, /primaryCta:focus-visible[\s\S]*secondaryCta:focus-visible/, /primaryCta:active[\s\S]*secondaryCta:active/),
	createHodOwner('Card actions', '../styles/cards-actions.css', /playCta:hover[\s\S]*partyCta:hover/, /playCta:focus-visible[\s\S]*partyCta:focus-visible/, /playCta:active[\s\S]*partyCta:active/),
	createHodOwner('Quick launch', '../styles/quick-launch.css', /quickLaunch a:hover/, /quickLaunch a:focus-visible/, /quickLaunch a:active/),
	createHodOwner('Featured world', '../styles/featured.css', /featuredWorld:hover/, /featuredWorld:focus-visible/, /featuredWorld:active/),
	createHodOwner('Filter tags', '../styles/filter-tags.css', /tag:hover/, /tag:focus-visible/, /tag:active/),
	createHodOwner('Filter disclosure', '../styles/filter-disclosure.css', /filterDisclosure summary:hover/, /filterDisclosure summary:focus-visible/, /filterDisclosure summary:active/),
	createHodOwner('Game title', '../styles/cards-meta.css', /gameTitleLink:hover/, /gameTitleLink:focus-visible/, /gameTitleLink:active/),
	createHodOwner('Commerce', '../styles/cards-commerce.css', /gameCommerce:hover/, /gameCommerce:focus-visible/, /gameCommerce:active/)
]);

const YESOD_CROSS_CUTTING_INTERACTION = readHodStyle('../styles/accessibility/interaction.css');
const NITZOTZ_MOTION = readHodStyle('../nitzotz-io/css/gameplay-motion.css');
const NITZOTZ_EXPERIENCE = readHodStyle('../nitzotz-io/css/experience-2026.css');

test('Nitzotz animated advanced summaries own hover and active feedback', proveNitzotzInteractionOwnership);
test('Storefront interactives own complete local interaction cycles', proveStorefrontLocalOwnership);
test('cross-cutting interaction CSS stays nonvisual and component-agnostic', proveYesodCrossCuttingBoundary);

/**
 * Creates one immutable interaction-owner specification from its localized stylesheet.
 * @param {string} hodName Human-readable owner name used in assertion messages.
 * @param {string} hodRelativePath Test-relative stylesheet path.
 * @param {RegExp} hodHoverPattern Required hover-state signature.
 * @param {RegExp} hodFocusPattern Required keyboard-focus signature.
 * @param {RegExp} hodActivePattern Required press-state signature.
 * @returns {Readonly<object>} Frozen owner covenant containing source and required state patterns.
 */
function createHodOwner(hodName, hodRelativePath, hodHoverPattern, hodFocusPattern, hodActivePattern) {
	return Object.freeze({
		name: hodName,
		source: readHodStyle(hodRelativePath),
		hover: hodHoverPattern,
		focus: hodFocusPattern,
		active: hodActivePattern
	});
}

/**
 * Reads one stylesheet directly from the current repository so tests guard actual cascade ownership.
 * @param {string} hodRelativePath Test-relative stylesheet path.
 * @returns {string} UTF-8 stylesheet source.
 */
function readHodStyle(hodRelativePath) {
	return readFileSync(new URL(hodRelativePath, import.meta.url), 'utf8');
}

/** @returns {void} Proves Nitzotz advanced disclosure motion still answers hover and press. */
function proveNitzotzInteractionOwnership() {
	assert.match(NITZOTZ_MOTION, /advanced-group > summary,[\s\S]*game-options > summary[\s\S]*transition:/);
	assert.match(NITZOTZ_MOTION, /advanced-group > summary:active,[\s\S]*game-options > summary:active/);
	assert.match(NITZOTZ_EXPERIENCE, /advanced-group > summary:hover/);
	assert.match(NITZOTZ_EXPERIENCE, /game-options > summary:hover/);
}

/** @returns {void} Proves every Storefront owner locally completes pointer, keyboard, press, touch, and motion states. */
function proveStorefrontLocalOwnership() {
	for (const hodOwner of HOD_STOREFRONT_INTERACTION_OWNERS) {
		assert.match(hodOwner.source, hodOwner.hover, `${hodOwner.name} needs local hover feedback`);
		assert.match(hodOwner.source, hodOwner.focus, `${hodOwner.name} needs local focus feedback`);
		assert.match(hodOwner.source, hodOwner.active, `${hodOwner.name} needs local active feedback`);
		assert.match(hodOwner.source, /touch-action:\s*manipulation/, `${hodOwner.name} needs explicit touch intent`);
		assert.match(hodOwner.source, /transition:/, `${hodOwner.name} needs deliberate transition language`);
		assert.match(hodOwner.source, /prefers-reduced-motion:\s*reduce/, `${hodOwner.name} needs reduced-motion ownership`);
	}
}

/** @returns {void} Proves the shared interaction layer remains a nonvisual affordance boundary rather than a style patch. */
function proveYesodCrossCuttingBoundary() {
	assert.match(YESOD_CROSS_CUTTING_INTERACTION, /-webkit-tap-highlight-color:\s*transparent/);
	for (const gevurahForbiddenSelector of ['primaryCta', 'playCta', 'quickLaunch', 'featuredWorld', 'tag', 'gameTitleLink', 'gameCommerce']) {
		assert.doesNotMatch(YESOD_CROSS_CUTTING_INTERACTION, new RegExp(`\\.${gevurahForbiddenSelector}`));
	}
}
