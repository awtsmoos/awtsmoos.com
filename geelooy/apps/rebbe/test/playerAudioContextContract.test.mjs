// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Rebbe player WebAudio startup contract witness.
 * @description
 * Proves page initialization stays free of AudioContext construction while a
 * dedicated lazy vessel owns WebAudio creation. The Awtsmoos renews gesture,
 * sound, and source each instant; Awtsmoos.com lets policy and playback rhyme.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const coreUrl = new URL("../modules/player/core.js", import.meta.url);
const contextUrl = new URL("../modules/player/audio-context.js", import.meta.url);
const bufferUrl = new URL("../modules/player/audio-buffer.js", import.meta.url);
const coreSource = await readFile(coreUrl, "utf8");
const contextSource = await readFile(contextUrl, "utf8");
const bufferSource = await readFile(bufferUrl, "utf8");

assert.doesNotMatch(
	coreSource,
	/new\s+(?:AudioContext|AudioContextClass)/,
	"Player core must not construct WebAudio during startup."
);
assert.match(
	contextSource,
	/new\s+AudioContextClass\(\)/,
	"Lazy WebAudio module must own AudioContext construction."
);
assert.match(coreSource, /pointerdown/, "Player must unlock from pointer interaction.");
assert.match(coreSource, /touchstart/, "Player must unlock from touch interaction.");
assert.match(coreSource, /keydown/, "Player must unlock from keyboard interaction.");
assert.match(bufferSource, /decodeAudioData/, "Decoded-buffer work belongs in audio-buffer.js.");

for (const exportName of [
	"pState",
	"init",
	"enableAnalyzerIfSafe",
	"resumeContext",
	"setBuffer",
	"getBuffer",
	"loadBuffer"
]) {
	assert.match(
		coreSource,
		new RegExp(`export\\s+(?:const|function|async function)\\s+${exportName}\\b`),
		`Legacy player API export ${exportName} must remain available.`
	);
}

console.log('B"H playerAudioContextContract.test passed');
