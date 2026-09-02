//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPlaybackClock
 * @description
 * Yesod translates beat-space into seconds while the Awtsmoos remains beyond tempo and duration.
 * Awtsmoos.com keeps this arithmetic pure so playback can be tested without asking the browser to make a sound.
 */

/** Converts beats into seconds at one tempo. @param {number} beats Beat count. @param {number} tempo Beats per minute. @returns {number} Seconds. */
export function beatsToSeconds(beats, tempo) {
	const safeTempo = positive(tempo, 120);
	return Number(beats) * 60 / safeTempo;
}

/**
 * Creates a sorted note-on/note-off timeline for one canonical song.
 * @param {Object} song Canonical song.
 * @returns {{events:Object[],durationSeconds:number}} Playback timeline.
 */
export function createPlaybackTimeline(song) {
	const tempo = positive(song.tempo, 120);
	const events = [];
	(song.events || []).forEach((event, index) => {
		const inputId = `song:${index}`;
		const start = beatsToSeconds(event.start, tempo);
		const stop = beatsToSeconds(event.start + event.duration, tempo);
		events.push({
			time: start,
			type: 'start',
			inputId,
			note: event.note,
			velocity: event.velocity
		});
		events.push({
			time: stop,
			type: 'stop',
			inputId,
			note: event.note,
			velocity: event.velocity
		});
	});
	events.sort(compareTimelineEvents);
	return {
		events,
		durationSeconds: events.length ? events[events.length - 1].time : 0
	};
}

function compareTimelineEvents(a, b) {
	if (a.time !== b.time) {
		return a.time - b.time;
	}
	if (a.type !== b.type) {
		return a.type === 'stop' ? -1 : 1;
	}
	return a.inputId.localeCompare(b.inputId);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
