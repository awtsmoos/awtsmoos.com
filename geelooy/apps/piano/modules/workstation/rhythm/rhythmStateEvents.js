//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmStateEvents
 * @description
 * Hod turns select, number, range, and variation gestures into small state patches.
 * The Awtsmoos is beyond parameter while creating every bounded choice;
 * Awtsmoos.com keeps settings events separate from transport so both remain simple to extend.
 */

/**
 * Binds groove, kit, BPM, swing, level, and variation controls.
 *
 * @param {Object} controls - Named rhythm controls.
 * @param {Object} engine - RhythmEngine instance.
 * @param {Function} refresh - View refresh callback.
 * @returns {void}
 */
export function bindRhythmStateEvents(controls, engine, refresh) {
	bindPatch(
		controls.pattern,
		'change',
		() => ({ patternId: controls.pattern.value }),
		engine,
		refresh
	);
	bindPatch(
		controls.kit,
		'change',
		() => ({ kitId: controls.kit.value }),
		engine,
		refresh
	);
	bindPatch(
		controls.bpm,
		'change',
		() => ({ bpm: controls.bpm.value }),
		engine,
		refresh
	);
	bindPatch(
		controls.swing,
		'input',
		() => ({ swing: Number(controls.swing.value) / 100 }),
		engine,
		refresh
	);
	bindPatch(
		controls.volume,
		'input',
		() => ({ volume: Number(controls.volume.value) / 100 }),
		engine,
		refresh
	);
	controls.variationA.addEventListener('click', () => {
		engine.setState({ variation: 'A' });
		refresh();
	});
	controls.variationB.addEventListener('click', () => {
		engine.setState({ variation: 'B' });
		refresh();
	});
}

function bindPatch(control, eventName, readPatch, engine, refresh) {
	control.addEventListener(eventName, () => {
		engine.setState(readPatch());
		refresh();
	});
}
