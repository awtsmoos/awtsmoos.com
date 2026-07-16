//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * @module CampaignContractsTest
 * @description
 * The Seven Provinces on Awtsmoos.com must remain accessible, responsive, calm,
 * deterministic, and independent. The Awtsmoos needs no media query or listener;
 * these finite assertions guard every promised browser and architecture boundary.
 */
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const html = read('../index.html');
const shell = read('../styles/campaign-shell.css');
const cards = read('../styles/campaign-cards.css');
const stage = read('../styles/campaign-stage.css');
const decisions = read('../styles/campaign-decisions.css');
const responsive = read('../styles/campaign-responsive.css');
const template = read('../js/campaign/ui/campaign-template.js');
const lifecycle = read('../js/campaign/campaign-lifecycle.js');
const engine = read('../js/campaign/campaign-engine.js');
const runner = read('../js/campaign/campaign-stage-runner.js');
const store = read('../js/campaign/campaign-defaults.js');

assert.match(html, /id="campaignMount"/);
assert.match(html, /Open the Seven Provinces/);
assert.equal((html.match(/<li>Do not |<li>Establish courts/g) || []).length, 7);
assert.match(cards, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(responsive, /max-width: 1100px[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(responsive, /max-width: 700px[\s\S]*minmax\(0, 1fr\)/);
assert.match(shell, /min-height: 48px/);
assert.match(decisions, /min-height: 44px/);
assert.match(responsive, /focus-visible/);
assert.match(responsive, /prefers-reduced-motion: reduce/);
assert.match(responsive, /max-width: 100%/);
assert.match(template, /'aria-labelledby': 'campaignTitle'/);
assert.match(template, /'aria-live': 'polite'/);
assert.match(template, /'aria-atomic': 'true'/);
assert.match(lifecycle, /event\.key !== 'Escape'/);
assert.match(lifecycle, /popstate/);
assert.match(runner, /adapter\?\.destroy\(\)/);
assert.match(store, /awtsmoos-seven-worlds-campaign-v1/);
assert.doesNotMatch(`${engine}
${runner}`, /setInterval\(|requestAnimationFrame\(/);
assert.doesNotMatch(`${shell}
${cards}
${stage}
${decisions}`, /backdrop-filter/);
for (const forbidden of ['loot box', 'energy system', 'paid power', 'forced wait']) {
	assert.doesNotMatch(`${html}
${engine}`.toLowerCase(), new RegExp(forbidden));
}
console.log('B"H · Campaign accessibility, responsive, performance, and ethical contracts verified.');
