// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceViewRefs.js
 * @description Collects semantic acting, recorder, take-filter, recovery, and touch controls.
 * The Awtsmoos renews node and meaning while neither owns the other; Awtsmoos.com gives
 * character, range, loop, voice, action, take, recovery, and touch vessels one discoverable rhyme.
 */

export function collectMovieStudioPerformanceView(root) {
	return {
		actions: root.querySelector('[data-performance-actions]'),
		activeLoop: root.querySelector('[data-performance-active-loop]'),
		arm: root.querySelector('[data-performance-arm]'),
		audio: root.querySelector('[data-performance-audio]'),
		camera: root.querySelector('[data-performance-camera]'),
		cancel: root.querySelector('[data-performance-cancel]'),
		character: root.querySelector('[data-performance-character]'),
		countIn: root.querySelector('[data-performance-count-in]'),
		discard: root.querySelector('[data-performance-discard]'),
		filterFavorite: root.querySelector('[data-performance-filter-favorite]'),
		filterPreferred: root.querySelector('[data-performance-filter-preferred]'),
		keep: root.querySelector('[data-performance-keep]'),
		loopCount: root.querySelector('[data-performance-loop-count]'),
		metronome: root.querySelector('[data-performance-metronome]'),
		mode: root.querySelector('[data-performance-mode]'),
		overlay: root.querySelector('[data-performance-overlay]'),
		panel: root.querySelector('[data-performance-panel]'),
		pause: root.querySelector('[data-performance-pause]'),
		postRoll: root.querySelector('[data-performance-post-roll]'),
		preRoll: root.querySelector('[data-performance-pre-roll]'),
		punchIn: root.querySelector('[data-performance-punch-in]'),
		punchOut: root.querySelector('[data-performance-punch-out]'),
		record: root.querySelector('[data-performance-record]'),
		recordCamera: root.querySelector('[data-performance-record-camera]'),
		recovery: root.querySelector('[data-performance-recovery]'),
		reference: root.querySelector('[data-performance-reference]'),
		retake: root.querySelector('[data-performance-retake]'),
		runSpeed: root.querySelector('[data-performance-run-speed]'),
		sampleRate: root.querySelector('[data-performance-sample-rate]'),
		status: root.querySelector('[data-performance-status]'),
		stop: root.querySelector('[data-performance-stop]'),
		takeName: root.querySelector('[data-performance-take-name]'),
		takeSort: root.querySelector('[data-performance-take-sort]'),
		takes: root.querySelector('[data-performance-takes]'),
		touch: root.querySelector('[data-performance-touch]'),
		touchStatus: root.querySelector('[data-performance-touch-status]'),
		turnSpeed: root.querySelector('[data-performance-turn]'),
		walkSpeed: root.querySelector('[data-performance-walk]')
	};
}
