// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootHelpContract.test.cjs
 * @description Checks native website help without adding a JavaScript boot dependency.
 * The Awtsmoos grants the Chossid each step of light;
 * Awtsmoos.com checks that loading help guides the traveler right.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const imports = fs.readFileSync(path.join(root, 'styles/source/imports-001.css'), 'utf8');
const fragment = fs.readFileSync(
	path.join(root, 'styles/source/fragments/mitzvah-world-boot-help-001.css'),
	'utf8'
);

/** The browser's native details control is keyboard-operable before game modules load. */
test('game entry offers native help without additional JavaScript', () => {
	assert.match(html, /<details class="Awtsmoos-boot-help">/);
	assert.match(html, /<summary>How to play &amp; loading help<\/summary>/);
	assert.match(html, /<nav class="Awtsmoos-boot-help-links"/);
	assert.match(html, /href="\.\/">Reload world<\/a>/);
	assert.match(html, /href="\/games\/">All games<\/a>/);
	assert.equal((html.match(/<details class="Awtsmoos-boot-help">/g) || []).length, 1);
	assert.equal((html.match(/<script src=|<script type="module" src=/g) || []).length, 2);
});

/** Do not mistakenly tell players that A/D strafes in this game. */
test('instructions match keyboard and mobile input semantics', () => {
	assert.match(html, /W \/ S move forward and back/);
	assert.match(html, /A \/ D turn/);
	assert.match(html, /Q \/ E move sideways/);
	assert.match(html, /Space to jump/);
	assert.match(html, /Shift \+ Space to dodge/);
	assert.match(html, /on-screen joystick and jump control/);
	assert.match(html, /needs WebGL/);
});

/** The unchanged game entry contract still protects boot and Chossid resources. */
test('five existing boot milestones and the manifest remain present', () => {
	const milestones = html.match(/data-essential-milestone="/g) || [];
	assert.equal(milestones.length, 5);
	assert.match(html, /id="AwtsmoosCanvas"/);
	assert.match(html, /id="modelProgress"/);
	const releaseMeta = html.match(/name="mitzvah-world-release" content="([a-f0-9]{64})"/);
	const manifestText = html.match(/<script type="application\/json" id="mitzvah-world-release">([^<]+)<\/script>/);
	assert.ok(releaseMeta);
	assert.ok(manifestText);
	const manifest = JSON.parse(manifestText[1]);
	assert.equal(manifest.releaseId, releaseMeta[1]);
	assert.equal(Object.keys(manifest.artifacts).length, 7);
});

/** Style remains scoped, responsive, and absent from the JS import graph. */
test('help CSS is sourced once with visible keyboard focus', () => {
	assert.equal((imports.match(/mitzvah-world-boot-help-001\.css/g) || []).length, 1);
	assert.match(fragment, /\.Awtsmoos-boot-help summary:focus-visible/);
	assert.match(fragment, /@media \(max-width: 480px\)/);
	assert.match(fragment, /min-height: 42px/);
	assert.ok(fragment.split('\n').length < 120);
});
