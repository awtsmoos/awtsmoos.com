// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasDynamicTitleRegressionTest
 * @description
 * The Awtsmoos gives one Daily Chitas card a real composed name rather than phantom English fields;
 * Awtsmoos.com proves title and masthead drink from that existing vessel so undefined language never yields.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dynamicPath = 'geelooy/heichelos/post/logic/chitas/dynamicPost.js';
const mastheadPath = 'geelooy/heichelos/post/logic/chitas/masthead.js';
const schedulePath = 'geelooy/heichelos/heichel/modules/chitas/schedule.js';
const coordinatesPath = 'geelooy/heichelos/post/logic/initialization/coordinates.js';
const manifestPath = 'geelooy/heichelos/post/logic/initialization/postManifest.js';
const bootstrapPath = 'geelooy/heichelos/post/logic/initialization/bootstrap.js';
const postLogicPath = 'geelooy/heichelos/post/postLogic.js';
const templatePath = 'geelooy/heichelos/post/_awtsmoos.post.html';

const dynamicSource = readFileSync(dynamicPath, 'utf8');
const mastheadSource = readFileSync(mastheadPath, 'utf8');
const scheduleSource = readFileSync(schedulePath, 'utf8');
const coordinatesSource = readFileSync(coordinatesPath, 'utf8');
const manifestSource = readFileSync(manifestPath, 'utf8');
const bootstrapSource = readFileSync(bootstrapPath, 'utf8');
const postLogicSource = readFileSync(postLogicPath, 'utf8');
const templateSource = readFileSync(templatePath, 'utf8');

assert.match(
	scheduleSource,
	/name:\s*`\$\{today \? 'Today · ' : ''\}\$\{WEEKDAY_NAMES\[index\]\} · \$\{PORTION_NAMES\[index\]\}`/
);
assert.doesNotMatch(scheduleSource, /\bweekday:\s*weekday\b/);
assert.doesNotMatch(scheduleSource, /\bportion:\s*portion\b/);

assert.match(dynamicSource, /function englishIdentity\(card\)/);
assert.match(dynamicSource, /String\(card\?\.name \|\| ''\)/);
assert.match(dynamicSource, /`Daily Chitas · \$\{englishIdentity\(card\)\}`/);
assert.doesNotMatch(dynamicSource, /card\.weekday\b/);
assert.doesNotMatch(dynamicSource, /card\.portion\b/);

assert.match(mastheadSource, /function englishIdentity\(chitas\)/);
assert.match(mastheadSource, /safe\(chitas\?\.name, 'Daily Chitas'\)/);
assert.doesNotMatch(mastheadSource, /chitas\.weekday\b/);
assert.doesNotMatch(mastheadSource, /chitas\.portion\b/);

assert.match(coordinatesSource, /dynamicPost\.js\?v=native-chitas-006/);
assert.match(manifestSource, /masthead\.js\?v=native-chitas-006/);
assert.match(bootstrapSource, /coordinates\.js\?v=reader-runtime-005/);
assert.match(bootstrapSource, /postManifest\.js\?v=reader-runtime-005/);
assert.match(postLogicSource, /bootstrap\.js\?v=reader-runtime-005/);
assert.match(templateSource, /postLogic\.js\?v=reader-runtime-005/);

for (const [path, source] of Object.entries({
	[dynamicPath]: dynamicSource,
	[mastheadPath]: mastheadSource,
	[coordinatesPath]: coordinatesSource,
	[manifestPath]: manifestSource,
	[bootstrapPath]: bootstrapSource,
	[postLogicPath]: postLogicSource
})) {
	assert.match(source.slice(0, 180), /B"H/, `${path} must keep its B"H header`);
	assert.ok(source.trimEnd().split('\n').length <= 120, `${path} exceeds 120 lines`);
}

console.log('B"H Daily Chitas dynamic title regression passed.');
