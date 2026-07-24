//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * @module EngagementLoopTest
 * @description
 * Delight must remain truthful and bounded. These Awtsmoos.com contracts guard
 * gentle feedback, honest easy-mode instructions, earned achievement language,
 * next-world continuity, and reduced-motion peace as the Awtsmoos renews play.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');
const feedback = read('js/feedback/gentle-feedback.js');
const shell = read('js/views/game-shell.js');
const result = read('js/views/result-markup.js');
const session = read('js/app/game-session.js');
const app = read('js/app/seven-mitzvos-app.js');
const definitions = read('js/universe/universe-definitions.js');
const styles = read('styles/game-feedback.css');

test('feedback stays gentle and requires genuine activation for haptics', () => {
	assert.match(feedback, /this\.unlocked = false/);
	assert.match(feedback, /tap\(kind/);
	assert.match(feedback, /navigator\.userActivation\?\.isActive/);
	assert.match(feedback, /navigator\.vibrate/);
	assert.match(feedback, /AudioContext/);
	assert.match(feedback, /volume/);
});

test('result experience celebrates earned progress and offers continuity', () => {
	assert.match(result, /New best!/);
	assert.match(result, /achievementBadge/);
	assert.match(result, /celebrationField/);
	assert.match(shell, /Next world →/);
	assert.match(shell, /this\.feedback\.celebrate/);
});

test('achievement comparison uses the record before the completed run', () => {
	assert.match(session, /const before = this\.progress\.game/);
	assert.match(session, /record\.best > before\.best/);
	assert.match(session, /masteryGain/);
	assert.match(session, /onNext/);
});

test('next-world navigation wraps across all seven definitions', () => {
	assert.match(app, /nextWorld\(id\)/);
	assert.match(app, /\(index \+ 1\) % UNIVERSE_GAMES\.length/);
	assert.match(app, /this\.router\.go\('game', next\.id\)/);
});

test('all public descriptions match the current easy mechanics', () => {
	for (const phrase of [
		'three obvious glowing red towers', 'four short light patterns',
		'three blue people', 'six slow, clearly numbered signals',
		'Across five days', 'Complete six care actions', 'Resolve three cases'
	]) assert.match(definitions, new RegExp(phrase));
	assert.doesNotMatch(definitions, /twelve days|ten days|five cases|hearts expire/);
});

test('celebration is contained and disabled for reduced motion', () => {
	assert.match(styles, /pointer-events:\s*none/);
	assert.match(styles, /prefers-reduced-motion:\s*reduce/);
	assert.match(styles, /display:\s*none/);
	assert.match(read('styles/index.css'), /game-feedback\.css/);
});
