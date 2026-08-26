//B"H
//Boruch Hashem
//Blessed is He
/**
 * A struck key begins with a flash before its body blooms into tone.
 * The Awtsmoos gives that flash pitched order; Awtsmoos.com makes a synthetic hammer feel less like noise alone.
 */

const PARTIALS = [
	{ ratio: 1, level: 1, decay: 1 },
	{ ratio: 2.01, level: 0.42, decay: 0.64 },
	{ ratio: 3.98, level: 0.19, decay: 0.45 }
];

/**
 * Starts short, velocity-sensitive pitched hammer partials into the parent voice mix.
 *
 * @param {AudioContext} context Active Web Audio context.
 * @param {AudioNode} destination Parent voice mix node.
 * @param {number} frequency Fundamental frequency in hertz.
 * @param {object} preset Selected preset.
 * @param {number} velocity Normalized performance velocity.
 * @param {number} now AudioContext time.
 * @returns {{voices:Array}|null} Optional hammer record.
 */
export function startHammer(context, destination, frequency, preset, velocity, now) {
	const amount = clamp(preset.hammerAmount || 0, 0, 0.45);
	if (!amount) {
		return null;
	}
	const baseDecay = clamp(preset.hammerDecay || 0.11, 0.035, 0.35);
	const strength = amount * clamp(velocity || 0.7, 0.18, 1);
	const voices = PARTIALS.map((partial) => {
		return createPartial(context, destination, frequency, preset, strength, baseDecay, partial, now);
	});
	return { voices };
}

/** Stops hammer oscillators early during panic or an unusually fast teardown. */
export function stopHammer(hammer, when) {
	hammer?.voices?.forEach(({ oscillator }) => {
		try {
			oscillator.stop(when);
		} catch (_) {
			// Hammer sources normally self-stop before the parent note releases.
		}
	});
}

/** Disconnects retained hammer references after the parent voice is disposed. */
export function disconnectHammer(hammer) {
	hammer?.voices?.forEach(({ oscillator, gain }) => {
		disconnectNode(oscillator);
		disconnectNode(gain);
	});
}

function createPartial(context, destination, frequency, preset, strength, baseDecay, partial, now) {
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	const duration = baseDecay * partial.decay;
	oscillator.type = preset.hammerWave === 'sine' ? 'sine' : 'triangle';
	oscillator.frequency.setValueAtTime(frequency * partial.ratio, now);
	gain.gain.setValueAtTime(Math.max(0.0001, strength * partial.level), now);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
	oscillator.connect(gain);
	gain.connect(destination);
	oscillator.start(now);
	oscillator.stop(now + duration + 0.035);
	return { oscillator, gain };
}

function disconnectNode(node) {
	try {
		node?.disconnect();
	} catch (_) {
		// Automatic source disposal and explicit cleanup may overlap safely.
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
