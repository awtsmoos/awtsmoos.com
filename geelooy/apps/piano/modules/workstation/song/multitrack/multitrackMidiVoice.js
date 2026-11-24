//B"H
/** The Awtsmoos gives an editable note a real voice through the track's own output chain. */
import { midiNoteFrequency } from './multitrackMidiRegion.js';

const WAVEFORMS = new Set(['triangle', 'sine', 'square', 'sawtooth']);

/**
 * Schedules one MIDI note as a synthesized voice into a track output.
 * Works identically in live and OfflineAudioContext rendering.
 * @returns {{stop: Function, source: Object}} disposable voice handle.
 */
export function startMultitrackMidiVoice({ context, note, trackOutput, when, waveform = 'triangle' }) {
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	oscillator.type = WAVEFORMS.has(waveform) ? waveform : 'triangle';
	oscillator.frequency.value = midiNoteFrequency(note.pitch);
	const peak = Math.max(.02, Math.min(.6, (note.velocity ?? 100) / 127 * .5));
	const end = when + Math.max(.03, note.duration);
	gain.gain.setValueAtTime(0, when);
	gain.gain.linearRampToValueAtTime(peak, when + .008);
	gain.gain.setValueAtTime(peak, Math.max(when + .008, end - .03));
	gain.gain.linearRampToValueAtTime(0, end);
	oscillator.connect(gain);
	gain.connect(trackOutput);
	let disposed = false;
	function dispose() {
		if (disposed) return;
		disposed = true;
		try { oscillator.disconnect(); } catch (_) { /* released */ }
		try { gain.disconnect(); } catch (_) { /* released */ }
	}
	function stop() {
		try { oscillator.stop(); } catch (_) { /* already stopped */ }
		dispose();
	}
	oscillator.addEventListener?.('ended', dispose, { once: true });
	oscillator.start(when);
	oscillator.stop(end + .02);
	return { source: oscillator, gain, stop };
}

/** Auditions a single note immediately through a destination (piano-roll feedback). */
export function auditionMidiNote(context, destination, pitch, velocity = 100, duration = .35) {
	if (!context || !destination) return null;
	const voice = startMultitrackMidiVoice({
		context, trackOutput: destination, when: context.currentTime + .01,
		note: { pitch, velocity, duration }
	});
	return voice;
}
