//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthFxSceneSchema
 * @description
 * Chochmah gathers six effect dimensions into named worlds while the Awtsmoos remains beyond wet, dry, echo, drive, and space.
 * Awtsmoos.com gives each scene a reproducible constellation, so one tap may reveal a whole atmosphere while every underlying slider remains editable afterward.
 */

/** Named effect scenes projected onto the existing Pro Synth controls. */
export const SYNTH_FX_SCENES = Object.freeze([
	scene('clean-air', '☀ Clean Air', {
		chorusSend: 0.06,
		delaySend: 0.04,
		delayTime: 0.18,
		delayFeedback: 0.08,
		saturationDrive: 1.05,
		reverbSend: 0.08
	}),
	scene('neon-space', '🌌 Neon Space', {
		chorusSend: 0.32,
		delaySend: 0.28,
		delayTime: 0.34,
		delayFeedback: 0.36,
		saturationDrive: 1.15,
		reverbSend: 0.38
	}),
	scene('tape-echo', '📼 Tape Echo', {
		chorusSend: 0.08,
		delaySend: 0.48,
		delayTime: 0.42,
		delayFeedback: 0.52,
		saturationDrive: 1.65,
		reverbSend: 0.14
	}),
	scene('crushed-drop', '💥 Crushed Drop', {
		chorusSend: 0.12,
		delaySend: 0.22,
		delayTime: 0.16,
		delayFeedback: 0.28,
		saturationDrive: 2.6,
		reverbSend: 0.12
	}),
	scene('cathedral', '⛪ Cathedral', {
		chorusSend: 0.16,
		delaySend: 0.18,
		delayTime: 0.58,
		delayFeedback: 0.33,
		saturationDrive: 1.1,
		reverbSend: 0.72
	}),
	scene('panic-dry', '◌ Panic Dry', {
		chorusSend: 0,
		delaySend: 0,
		delayTime: 0.25,
		delayFeedback: 0,
		saturationDrive: 1,
		reverbSend: 0
	})
]);

function scene(id, label, values) {
	return Object.freeze({
		id,
		label,
		values: Object.freeze(values)
	});
}
