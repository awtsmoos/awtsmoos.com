//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRulerSeek
 * The Awtsmoos lets the finger move the clock without shaking the entire song;
 * Awtsmoos.com paints one marker until the hand is done, then plays along.
 */
import { secondsAtX } from './multitrackViewportGeometry.js';
import { seekMultitrackSong, songDuration } from './multitrackTimelineOperations.js';
import { paintMultitrackPlayhead } from './multitrackPlayheadTicker.js';
import { seekMultitrackAudio } from './multitrackSeekTransport.js';
import { stopMultitrackProject, playMultitrackProject } from './multitrackTransportActions.js';

/** Enables accurate ruler drag-seeking without rerendering entire tracks per finger movement.
 * @param {Object} dom - Timeline ruler.
 * @param {Object} state - Transport and editable audio project.
 */
export function bindMultitrackRulerSeek(dom, state) {
	let drag = null;
	let lastRelease = -Infinity;
	const position = event => Math.min(songDuration(state), secondsAtX(dom, state, event.clientX));
	const preview = event => {
		state.selection.playheadSeconds = position(event);
		paintMultitrackPlayhead(dom, state);
	};
	dom.ruler.addEventListener('pointerdown', event => {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		drag = { pointerId: event.pointerId, resume: state.playing };
		if (drag.resume) stopMultitrackProject(state);
		preview(event);
		dom.ruler.setPointerCapture?.(event.pointerId);
		event.preventDefault();
	});
	dom.ruler.addEventListener('pointermove', event => {
		if (!drag || event.pointerId !== drag.pointerId) return;
		preview(event);
		event.preventDefault();
	});
	dom.ruler.addEventListener('pointerup', async event => {
		if (!drag || event.pointerId !== drag.pointerId) return;
		const completed = drag;
		drag = null;
		lastRelease = Date.now();
		seekMultitrackSong(dom, state, position(event));
		if (completed.resume) await resumeAudio(state);
	});
	dom.ruler.addEventListener('pointercancel', () => { drag = null; });
	dom.ruler.addEventListener('click', event => {
		if (Date.now() - lastRelease < 300) return;
		event.stopPropagation();
		void seekMultitrackAudio(dom, state, position(event));
	});
}

/** @param {Object} state - Playing transport. */
async function resumeAudio(state) {
	try {
		await playMultitrackProject(state);
	} catch (error) {
		state.setStatus(`Cannot play from ruler: ${error?.message || 'Unknown error'}`);
	}
}
