//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmTransportEvents
 * @description
 * Netzach receives play, stop, fill, visibility, and tap-tempo gestures without mixing them with parameter plumbing.
 * The Awtsmoos creates gesture and consequence together;
 * Awtsmoos.com keeps transport events explicit so the musical clock remains easy to inspect.
 */

/**
 * Binds panel visibility, transport, fill, and tap-tempo controls.
 *
 * @param {Object} controls - Named rhythm controls.
 * @param {Object} engine - RhythmEngine instance.
 * @param {Object} tapTempo - RhythmTapTempo instance.
 * @param {Function} refresh - View refresh callback.
 * @returns {void}
 */
export function bindRhythmTransportEvents(
	controls,
	engine,
	tapTempo,
	refresh
) {
	controls.toggle.addEventListener('click', () => {
		controls.panel.classList.remove('rhythm-panel-hidden');
	});
	controls.close.addEventListener('click', () => {
		controls.panel.classList.add('rhythm-panel-hidden');
	});
	controls.play.addEventListener('click', async () => {
		if (engine.isPlaying) {
			engine.stop();
		} else {
			await engine.start();
		}
		refresh();
	});
	controls.fill.addEventListener('click', () => {
		engine.requestFill();
		controls.fill.classList.add('rhythm-fill-armed');
		setTimeout(() => {
			controls.fill.classList.remove('rhythm-fill-armed');
		}, 700);
	});
	controls.tap.addEventListener('click', () => {
		const bpm = tapTempo.registerTap();
		if (bpm === null) {
			return;
		}
		engine.setState({ bpm });
		refresh();
	});
}
