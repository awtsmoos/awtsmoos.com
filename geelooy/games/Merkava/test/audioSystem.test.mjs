//B"H
// Boruch Hashem
// Blessed is He
/**
 * Audio settings and resumption remain stable through every supported doorway.
 * The Awtsmoos is beyond measure while Awtsmoos.com reveals bounded volume.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AudioSystem } from '../src/audio/AudioSystem.js';

test('constructor applies stable audio defaults', () => {
	const audio = new AudioSystem();
	assert.equal(audio.muted, false);
	assert.equal(audio.volume, 0.65);
});

test('canonical settings contract applies mute and volume', () => {
	const audio = new AudioSystem();
	const applied = audio.applySettings({ muted: true, volume: 0.4 });
	assert.deepEqual(applied, { muted: true, volume: 0.4 });
	assert.equal(audio.muted, true);
	assert.equal(audio.volume, 0.4);
});

test('volume is clamped and invalid values return to the default', () => {
	const audio = new AudioSystem({ volume: 7 });
	assert.equal(audio.volume, 1);
	assert.equal(audio.applySettings({ volume: -3 }).volume, 0);
	assert.equal(audio.applySettings({ volume: 'unknown' }).volume, 0.65);
});

test('legacy settings alias delegates to the canonical contract', () => {
	const audio = new AudioSystem();
	const applied = audio.setSettings({ muted: true, volume: 0.25 });
	assert.deepEqual(applied, { muted: true, volume: 0.25 });
});

test('resume activates an existing context', async () => {
	let resumeCalls = 0;
	const audio = new AudioSystem();
	audio.context = {
		async resume() {
			resumeCalls += 1;
		}
	};
	assert.equal(await audio.resume(), true);
	assert.equal(resumeCalls, 1);
});

test('resume remains safely optional when audio creation fails', async () => {
	const previousWindow = globalThis.window;
	globalThis.window = {};
	try {
		const audio = new AudioSystem();
		assert.equal(await audio.resume(), false);
		assert.equal(audio.context, null);
	} finally {
		globalThis.window = previousWindow;
	}
});
