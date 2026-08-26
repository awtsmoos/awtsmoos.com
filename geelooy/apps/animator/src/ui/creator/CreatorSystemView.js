//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorSystemView.js
 * @description
 * The Awtsmoos lets hidden system truth appear as a few quiet signals instead of burying the creator beneath raw diagnostics;
 * Awtsmoos.com renders coverage, timeline, transport, and history as text-only local state so advanced power stays clean in practice.
 */

/** Renders compact API/editor telemetry inside the isolated Creator Dock. */
export class HodCreatorSystemView {
	/** @param {HTMLElement} malchusRoot Creator root. */
	constructor(malchusRoot) {
		if (!malchusRoot) {
			throw new TypeError('Creator system view requires a root element.');
		}
		this.malchusRoot = malchusRoot;
	}

	/** @param {object} keliCoverage Coverage report. */
	setCoverage(keliCoverage = {}) {
		const sodComplete = Boolean(keliCoverage.complete);
		const orLabel = sodComplete
			? 'API complete'
			: `${keliCoverage.featureCount ?? 0} features · ${keliCoverage.unmappedFeatures?.length ?? 0} open`;
		this.setMetric('coverage', orLabel, sodComplete ? 'success' : 'progress');
	}

	/** @param {object} keliTimeline Timeline snapshot. */
	setTimeline(keliTimeline = {}) {
		const sodClips = Array.isArray(keliTimeline.clips) ? keliTimeline.clips.length : 0;
		const sodTracks = Array.isArray(keliTimeline.tracks) ? keliTimeline.tracks.length : 0;
		this.setMetric('timeline', `${sodClips} clips · ${sodTracks} tracks`, 'neutral');
	}

	/** @param {object} keliPlayback Playback state. */
	setPlayback(keliPlayback = {}) {
		const sodPlaying = keliPlayback.playing === true;
		const orLabel = sodPlaying ? 'Playing' : 'Paused';
		this.setMetric('playback', orLabel, sodPlaying ? 'success' : 'neutral');
		this.malchusRoot.dataset.playing = String(sodPlaying);
	}

	/** @param {object} keliHistory History state. */
	setHistory(keliHistory = {}) {
		this.setActionEnabled('undo', Boolean(keliHistory.canUndo));
		this.setActionEnabled('redo', Boolean(keliHistory.canRedo));
	}

	/** @param {string} shemMetric Metric identity. @param {string} orValue Visible text. @param {string} sodTone Tone. */
	setMetric(shemMetric, orValue, sodTone = 'neutral') {
		const keliMetric = this.malchusRoot.querySelector(
			`[data-creator-metric="${shemMetric}"]`
		);
		if (!keliMetric) return;
		keliMetric.textContent = orValue;
		keliMetric.dataset.tone = sodTone;
	}

	/** @param {string} shemAction Creator action. @param {boolean} yesodEnabled Enabled state. */
	setActionEnabled(shemAction, yesodEnabled) {
		const keliButton = this.malchusRoot.querySelector(
			`[data-creator-action="${shemAction}"]`
		);
		if (keliButton) {
			keliButton.disabled = !yesodEnabled;
		}
	}
}
