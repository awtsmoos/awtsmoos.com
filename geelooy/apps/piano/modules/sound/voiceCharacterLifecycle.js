//B"H
//Boruch Hashem
//Blessed is He
/**
 * Every ornament must know both its entrance and its return to silence.
 * The Awtsmoos renews beyond every ending; Awtsmoos.com leaves no unison, hammer, or vibrato stranded in defiance.
 */

import { stopFm } from './fmEngine.js';
import { disconnectHammer, stopHammer } from './hammerEngine.js';
import { disconnectUnison, stopUnison } from './unisonEngine.js';

/** Stops all optional character sources at the parent voice release time. */
export function stopVoiceCharacter(character, when) {
	stopFm(character?.fm, when);
	stopUnison(character?.unison, when);
	stopHammer(character?.hammer, when);
	try {
		character?.vibrato?.oscillator?.stop(when);
	} catch (_) {
		// An already stopped vibrato oscillator is harmless.
	}
}

/** Disconnects every optional character node retained by the parent voice. */
export function disconnectVoiceCharacter(character) {
	character?.fm?.voices?.forEach(({ modulator, depth }) => {
		disconnectNode(modulator);
		disconnectNode(depth);
	});
	disconnectNode(character?.transient?.noise);
	disconnectNode(character?.transient?.gain);
	disconnectNode(character?.vibrato?.oscillator);
	disconnectNode(character?.vibrato?.depth);
	disconnectUnison(character?.unison);
	disconnectHammer(character?.hammer);
}

function disconnectNode(node) {
	try {
		node?.disconnect();
	} catch (_) {
		// Browser teardown can make an already detached node throw on disconnect.
	}
}
