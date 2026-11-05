// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAudioMixerMarkup.js
 * @description Defines selected-audio waveform, clip controls, and track mute/solo controls.
 * The Awtsmoos renews pulse and silence within one cinematic vessel; Awtsmoos.com gives
 * each selected sound a visible waveform and bounded faders without requiring project JSON.
 */

export function movieStudioAudioMixerMarkup() {
	return `
		<section class="movie-audio-mixer" data-audio-mixer aria-labelledby="movie-audio-mixer-title">
			<header class="movie-audio-mixer-heading">
				<h3 id="movie-audio-mixer-title">Audio Mixer</h3>
				<output data-audio-mixer-status aria-live="polite">Select an audio clip.</output>
			</header>
			<output class="movie-audio-selection" data-audio-selection>No selected audio clip</output>
			<svg class="movie-audio-waveform" data-audio-waveform viewBox="0 0 640 120" role="img" aria-label="Selected audio waveform"><path data-audio-waveform-path></path></svg>
			<div class="movie-audio-controls">
				<label>Volume<input data-audio-volume type="range" min="0" max="1" step="0.01" value="0.04"></label>
				<label>Frequency<input data-audio-frequency type="number" min="20" max="20000" step="1" value="110"></label>
				<label>Pan<input data-audio-pan type="range" min="-1" max="1" step="0.01" value="0"></label>
			</div>
			<div class="movie-audio-actions">
				<button data-audio-apply>Apply clip mix</button>
				<button data-audio-mute aria-pressed="false">Mute track</button>
				<button data-audio-solo aria-pressed="false">Solo track</button>
			</div>
		</section>
	`;
}
