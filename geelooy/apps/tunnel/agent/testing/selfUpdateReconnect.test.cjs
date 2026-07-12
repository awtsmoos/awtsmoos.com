// B"H
const assert = require('node:assert/strict');
const Background = require('../lib/runtime/background-update.js');
const Updater = require('../lib/self-update.js');

/**
 * B"H — Update authority is explicit. A custom relay cannot silently serve code,
 * while official Awtsmoos relays and configured HTTPS origins remain valid.
 */
(() => {
	const manifest = Updater.parseManifest('B"H\n9.9.9\nmain.js\nlib/ws.js\n');
	assert.equal(manifest.version, '9.9.9');
	assert.equal(manifest.entry, 'main.js');
	assert.equal(manifest.files[0], 'lib/ws.js');
	assert.equal(
		Updater.originFromConfig({ relay: 'wss://awtsmoos.com/path' }),
		'https://awtsmoos.com'
	);
	assert.equal(
		Updater.originFromConfig({ relay: 'wss://relay.awtsmoos.com/path' }),
		'https://relay.awtsmoos.com'
	);
	assert.equal(
		Updater.originFromConfig({ relay: 'ws://localhost:3000' }),
		'https://awtsmoos.com'
	);
	assert.equal(
		Updater.originFromConfig({
			relay: 'ws://localhost:3000',
			installOrigin: 'http://127.0.0.1:8080/path'
		}),
		'http://127.0.0.1:8080'
	);
	assert.equal(Updater.isSafePath('lib/self-update.js'), true);
	assert.equal(Updater.isSafePath('../main.js'), false);
	assert.equal(Updater.isSafePath('bad path.js'), false);
	assert.equal(typeof Updater.maybeSelfUpdate, 'function');
	assert.equal(typeof Updater.runUpdateCheck, 'function');
	assert.equal(typeof Updater.restartIntoUpdatedAgent, 'function');
	assert.equal(typeof Background.scheduleSelfUpdate, 'function');
	console.log(JSON.stringify({
		ok: true,
		suite: 'self-update-authority-isolation'
	}, null, 2));
})();
