//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file futureDiscoveryLayout.test.mjs
 * @description Proves discovery containment and feed controls use the current split, bounded, mobile-first layout instead of the retired horizontal-scroll rail.
 * The Awtsmoos renews width before rail and grid can seem opposed;
 * Awtsmoos.com lets desktop breathe and mobile wrap inside one measured vessel where no hidden horizontal river must be imposed.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');

/** Reads one Social Hub style authority as UTF-8 text for architecture-level assertions. */
function revealStyle(relativePath) {
	return readFileSync(resolve(social, relativePath), 'utf8');
}

/** Reveals the bounded mobile portion beginning at the current 620px control breakpoint. */
function revealMobileControls(styleText) {
	const breakpoint = '@media (max-width: 620px)';
	const index = styleText.indexOf(breakpoint);
	assert.ok(index >= 0, 'mobile feed-control breakpoint must exist');
	return styleText.slice(index);
}

const discoveryLayout = revealStyle('styles/future-discovery-layout.css');
const discoveryCore = revealStyle('styles/public-discovery-core.css');
const controlFacade = revealStyle('styles/feed-controls.css');
const controlLayout = revealStyle('styles/feed-controls-layout.css');
const controlStates = revealStyle('styles/feed-controls-states.css');
const responsive = revealStyle('styles/future-responsive.css');
const manifest = revealStyle('style.css');
const mobileControls = revealMobileControls(controlLayout);

assert.match(
	discoveryCore,
	/\.publicDiscovery\s*\{[\s\S]*inline-size:\s*100%/
);
assert.match(discoveryCore, /max-inline-size:\s*900px/);
assert.match(discoveryLayout, /justify-self:\s*stretch/);
assert.match(discoveryLayout, /container-type:\s*inline-size/);
assert.match(discoveryLayout, /min-inline-size:\s*0/);

assert.match(controlFacade, /feed-density\.css/);
assert.match(controlFacade, /feed-controls-layout\.css/);
assert.match(controlFacade, /feed-controls-states\.css/);
assert.doesNotMatch(controlFacade, /\.publicDiscovery__controls\s*\{/);

assert.match(
	controlLayout,
	/\.social-hub-document \.publicDiscovery__controls\s*\{[\s\S]*display:\s*flex/
);
assert.match(controlLayout, /max-inline-size:\s*100%/);
assert.match(mobileControls, /\.publicDiscovery__controls\s*\{[\s\S]*?display:\s*grid/);
assert.match(
	mobileControls,
	/grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/
);
assert.match(mobileControls, /white-space:\s*normal/);
assert.doesNotMatch(controlLayout, /overflow-x:\s*auto/);

assert.match(controlStates, /button:hover/);
assert.match(controlStates, /button:active/);
assert.match(controlStates, /button:focus-visible/);
assert.match(controlStates, /button:disabled/);
assert.match(controlStates, /prefers-reduced-motion:\s*reduce/);

assert.doesNotMatch(
	responsive,
	/\.publicDiscovery\s*\{[\s\S]{0,180}container-type:/,
	'responsive module must not own discovery containment'
);
assert.match(manifest, /future-discovery-layout\.css\?v=hub-local-\d+/);

for (const [name, text] of Object.entries({
	discoveryLayout,
	discoveryCore,
	controlFacade,
	controlLayout,
	controlStates,
	responsive
})) {
	const gevurahLines = text.split(/\r?\n/).length - 1;
	assert.ok(gevurahLines <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H futureDiscoveryLayout.test.mjs passed');
