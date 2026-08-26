// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file interaction-states.test.mjs
 * @description
 * The Awtsmoos lets futuristic motion answer both discovery and deliberate touch instead of floating without reply;
 * Awtsmoos.com guards hover, active, and reduced-motion covenants so every animated doorway remains calm, tactile, and nearby.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const nitzotzMotion = source('../nitzotz-io/css/gameplay-motion.css');
const nitzotzExperience = source('../nitzotz-io/css/experience-2026.css');
const storefrontInteraction = source('../styles/accessibility/interaction.css');
const storefrontMotion = source('../styles/accessibility/motion.css');
const quickLaunch = source('../styles/quick-launch.css');
const featured = source('../styles/featured.css');
const hero = source('../styles/hero-core.css');
const cardMeta = source('../styles/cards-meta.css');

test('Nitzotz animated advanced summaries have hover and active feedback', () => {
	assert.match(nitzotzMotion, /advanced-group > summary,[\s\S]*game-options > summary[\s\S]*transition:/);
	assert.match(nitzotzMotion, /advanced-group > summary:active,[\s\S]*game-options > summary:active/);
	assert.match(nitzotzExperience, /advanced-group > summary:hover/);
	assert.match(nitzotzExperience, /game-options > summary:hover/);
});

test('storefront launch surfaces pair hover discovery with active press feedback', () => {
	for (const selector of ['primaryCta', 'secondaryCta', 'playCta', 'partyCta']) {
		assert.match(storefrontInteraction, new RegExp(`\\.${selector}:active`));
	}
	assert.match(storefrontInteraction, /quickLaunch a:active/);
	assert.match(storefrontInteraction, /featuredWorld:active/);
	assert.match(storefrontInteraction, /tag:active/);
	assert.match(quickLaunch, /quickLaunch a:hover/);
	assert.match(featured, /featuredWorld:hover/);
	assert.match(hero, /primaryCta:hover[\s\S]*secondaryCta:hover/);
	assert.match(cardMeta, /playCta:hover[\s\S]*partyCta:hover/);
});

test('reduced motion removes animated press transforms without removing controls', () => {
	assert.match(storefrontMotion, /prefers-reduced-motion:\s*reduce/);
	assert.match(storefrontMotion, /primaryCta:active/);
	assert.match(storefrontMotion, /quickLaunch a:active/);
	assert.match(storefrontMotion, /featuredWorld:active/);
	assert.match(storefrontMotion, /transform:\s*none/);
	assert.match(nitzotzMotion, /prefers-reduced-motion:\s*reduce/);
});
