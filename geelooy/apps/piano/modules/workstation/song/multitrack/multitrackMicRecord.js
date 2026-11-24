//B"H
/** The Awtsmoos sings over the sounding arrangement and the voice finds its true place. */
import { AudioState } from '../../../audio.js';
import { MicCaptureSession } from '../../../recording/micCapture.js';
import { placeRecordedClip } from './multitrackMicSafety.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { createMultitrackClip, createMultitrackTrack, replaceMultitrackTrack } from './multitrackProject.js';
import { createMultitrackId } from './multitrackIds.js';
import { playMultitrackProject, stopMultitrackProject } from './multitrackTransportActions.js';
import { multitrackPlayback } from './multitrackPlayback.js';

/**
 * Owns one simultaneous take: the arrangement keeps playing while the
 * armed track captures the microphone on the same audio clock.
 */
export class MultitrackMicTake {
	constructor(state, options = {}) {
		this.state = state;
		this.capture = new MicCaptureSession({ onFeedbackCut: () => options.onFeedbackCut?.(this) });
		this.recording = false;
		this.armedTrackId = options.armedTrackId || null;
	}

	/** Resolves the armed audio track, creating a Vocal track when asked. */
	resolveTrack(createIfMissing = false) {
		const project = this.state.project;
		const armed = project.tracks.find(track => track.id === this.armedTrackId && track.kind !== 'midi');
		if (armed) return armed;
		const selected = project.tracks.find(track => track.id === this.state.selection.trackId && track.kind !== 'midi');
		if (selected) { this.armedTrackId = selected.id; return selected; }
		const first = project.tracks.find(track => track.kind !== 'midi');
		if (first) { this.armedTrackId = first.id; return first; }
		if (!createIfMissing) return null;
		const track = createMultitrackTrack({ name: 'Vocals' });
		this.state.setProject({ ...project, tracks: [...project.tracks, track] });
		this.armedTrackId = track.id;
		return track;
	}

	/**
	 * Starts playback (when anything is audible) and mic capture together.
	 * Capture opens first so its clock can be compared with the transport's.
	 * @param {Object} options - {mode, monitor, duckDb, autoGainControl}.
	 */
	async start(options = {}) {
		if (this.recording) throw new Error('A microphone take is already recording.');
		const track = this.resolveTrack(true);
		const context = AudioState.context;
		if (!context || !AudioState.masterGain)
			throw new Error('Start the Piano audio engine before recording.');
		this.transportStart = this.state.selection.playheadSeconds;
		const started = await this.capture.start({
			context,
			mode: options.mode,
			monitor: options.monitor,
			monitorDestination: AudioState.masterGain,
			autoGainControl: options.autoGainControl,
			duckGainNode: options.duckDb < 0 ? AudioState.masterGain : null,
			duckDb: options.duckDb
		});
		this.captureStartContextTime = started.startContextTime;
		this.playbackStartContextTime = context.currentTime;
		this.playbackWasRunning = false;
		try {
			this.playbackWasRunning = await playMultitrackProject(this.state);
			this.playbackStartContextTime = multitrackPlayback.clockStart || this.playbackStartContextTime;
		} catch (_) {
			// Nothing audible to play — the take still records against the
			// playhead clock so live piano playing can be sung over.
			this.playbackWasRunning = false;
		}
		this.recording = true;
		this.state.setStatus(`● Recording voice on “${track.name}” from ${this.transportStart.toFixed(2)}s — the arrangement keeps playing.`);
		return started;
	}

	/** Stops capture and transport, then places the take as one clip (one Undo step). */
	async stop() {
		if (!this.recording) return null;
		this.recording = false;
		const result = await this.capture.stop();
		if (this.playbackWasRunning || multitrackPlayback.isPlaying()) stopMultitrackProject(this.state);
		if (!result?.buffer || result.duration <= 0.05) {
			this.state.setStatus('Microphone take was too short to keep.');
			return null;
		}
		const placement = placeRecordedClip({
			transportStart: this.transportStart,
			captureStartContextTime: this.captureStartContextTime,
			playbackStartContextTime: this.playbackStartContextTime,
			capturedDuration: result.duration,
			...result.latency
		});
		if (placement.duration <= 0.05) {
			this.state.setStatus('Microphone take fell entirely before the timeline start.');
			return null;
		}
		const bufferId = createMultitrackId('buffer');
		multitrackAudioStore.setBuffer(bufferId, result.buffer, 'Voice Take');
		const track = this.resolveTrack(false);
		const clip = createMultitrackClip({
			name: 'Voice Take',
			bufferId,
			timelineStart: placement.timelineStart,
			sourceOffset: placement.sourceOffset,
			duration: placement.duration,
			latencyCompensation: placement.compensation
		});
		const updated = { ...track, clips: [...track.clips, clip] };
		this.state.setProject(replaceMultitrackTrack(this.state.project, updated));
		this.state.selectClip(track.id, clip.id);
		this.state.setStatus(`Voice take placed at ${placement.timelineStart.toFixed(2)}s on “${track.name}”`
			+ ` (latency compensation ${Math.round(placement.compensation * 1000)} ms)`
			+ (result.feedbackCut ? ' · monitoring was cut by the feedback guard.' : '.'));
		return { clip, track, placement, feedbackCut: result.feedbackCut };
	}
}
