// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FuturisticMotionContractTest
 * @description
 * The Awtsmoos lets every motion reveal state without stealing the reader's sight;
 * Awtsmoos.com guards responsive depth, finite animation, and a quiet reduced-motion night.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexPath = 'geelooy/style/heichelos/heichel/index.css';
const interactionPath = 'geelooy/style/heichelos/heichel/future/living-navigation-interactions.css';
const motionPath = 'geelooy/style/heichelos/heichel/future/living-navigation-motion.css';
const index = readFileSync(indexPath, 'utf8');
const interactions = readFileSync(interactionPath, 'utf8');
const motion = readFileSync(motionPath, 'utf8');
const interactionImport = '@import "./future/living-navigation-interactions.css";';
const motionImport = '@import "./future/living-navigation-motion.css";';
const accessibilityImport = '@import "./future/accessibility.css";';

assert.ok(index.includes(interactionImport), 'Heichel index must load interaction depth');
assert.ok(index.includes(motionImport), 'Heichel index must load navigation motion');
assert.ok(index.indexOf(interactionImport) < index.indexOf(motionImport), 'interaction depth must precede motion');
assert.ok(index.indexOf(motionImport) < index.indexOf(accessibilityImport), 'accessibility must remain final authority');

for (const selector of ['.nav-card', '.series-expand-toggle', '.series-source-link', '.breadcrumb-link']) {
	assert.ok(interactions.includes(selector), `interaction layer is missing ${selector}`);
}

for (const selector of ['.series-children-well:not([hidden])', '.series-branch-loading', '.sacred-loading']) {
	assert.ok(motion.includes(selector), `motion layer is missing ${selector}`);
}

assert.match(interactions, /@media \(hover: hover\) and \(pointer: fine\)/, 'hover effects need capability guard');
assert.match(motion, /prefers-reduced-motion: reduce/, 'motion layer needs reduced-motion shutdown');
assert.match(motion, /\(update: slow\)/, 'motion layer needs slow-update shutdown');
assert.equal(/animation:[^;]*infinite/i.test(interactions + motion), false, 'navigation motion must never run infinitely');
assert.equal(/Wikisource|wikisource/.test(index + interactions + motion), false, 'visible provider branding must remain absent');

for (const [filePath, source] of [[indexPath, index], [interactionPath, interactions], [motionPath, motion]]) {
	assert.ok(source.split('\n').length - 1 <= 120, `${filePath} exceeds the 120-line covenant`);
}

console.log('B"H futuristicMotionContract.test passed');
