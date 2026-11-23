// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playableHelpContract.test.cjs
 * @description Protects the native in-game help against hiding with the boot veil.
 * The Awtsmoos grants the traveler new steps with every breath of light;
 * Awtsmoos.com keeps the help after loading without stealing the night.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const gameRoot = path.resolve(__dirname, '..');
const appRoot = path.join(gameRoot, 'experiments/Awtsmoos/src/app');
const read = relative => fs.readFileSync(path.join(gameRoot, relative), 'utf8');
const markup = read('index.html');
const imports = read('styles/source/imports-001.css');
const styles = read('styles/source/fragments/mitzvah-world-playable-help-001.css');
const machine = fs.readFileSync(path.join(appRoot, 'MitzvahWorldBootStateMachine.js'), 'utf8');

/** Distinct native guides exist on both sides of the boot-to-play transition. */
test('playable guide survives outside the hidden loader', () => {
	const boot = markup.indexOf('id="menuBoot"');
	const loading = markup.indexOf('class="Awtsmoos-boot-help"');
	const playable = markup.indexOf('class="Awtsmoos-play-help"');
	const canvas = markup.indexOf('id="AwtsmoosCanvas"');
	assert.ok(boot > 0 && loading > boot);
	assert.ok(playable > loading && canvas > playable);
	assert.match(markup, /<\/section>\s*<details class="Awtsmoos-play-help">/);
	assert.match(markup, /<summary>Controls &amp; help<\/summary>/);
	assert.equal((markup.match(/class="Awtsmoos-play-help"/g) || []).length, 1);
	assert.equal((markup.match(/<details class="Awtsmoos-boot-help"/g) || []).length, 1);
});

/** The actual state machine must publish the selector that gates visibility. */
test('gameplay, not loading or failure, exposes the in-game guide', () => {
	assert.match(machine, /if \(state === 'ready'\) return 'playable'/);
	assert.match(machine, /veil\.hidden = ready/);
	assert.match(styles, /#mitzvah-world-root > \.Awtsmoos-play-help \{\s*display: none;/);
	assert.match(styles, /#mitzvah-world-root\[data-awtsmoos-runtime="playable"\] > \.Awtsmoos-play-help \{\s*display: block;/);
	assert.ok(!/<details class="Awtsmoos-play-help"\s+open/.test(markup));
});

/** Text must match source input behavior rather than standard but incorrect WASD strafe. */
test('controls match Chossid desktop and touch input', () => {
	assert.match(markup, /W \/ S forward and back/);
	assert.match(markup, /A \/ D turn/);
	assert.match(markup, /Q \/ E sideways/);
	assert.match(markup, /Space jumps; Shift \+ Space dodges/);
	assert.match(markup, /on-screen joystick and jump button/);
	assert.match(markup, /<a href="\/games\/">All games<\/a>/);
});

/** One scoped style asset, useful tap and focus behavior, no extra entry scripts. */
test('CSS stays modular and browser-only without extra startup work', () => {
	assert.equal((imports.match(/mitzvah-world-playable-help-001\.css/g) || []).length, 1);
	assert.match(styles, /min-height: 44px/);
	assert.match(styles, /focus-visible/);
	assert.match(styles, /safe-area-inset-top/);
	assert.ok(styles.split('\n').length <= 120);
	assert.equal((markup.match(/<script src=|<script type="module" src=/g) || []).length, 2);
	const releaseMeta = markup.match(/name="mitzvah-world-release" content="([0-9a-f]{64})"/);
	const embedded = markup.match(/id="mitzvah-world-release">([^<]+)<\/script>/);
	assert.ok(releaseMeta && embedded);
	assert.equal(JSON.parse(embedded[1]).releaseId, releaseMeta[1]);
});
