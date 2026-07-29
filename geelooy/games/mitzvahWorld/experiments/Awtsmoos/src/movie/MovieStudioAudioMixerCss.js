// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAudioMixerCss.js
 * @description Styles localized waveform, faders, meters, and track-state controls responsively.
 * The Awtsmoos is beyond amplitude and silence while every finite sound deserves a readable witness;
 * Awtsmoos.com keeps waveform and controls touch-safe inside desktop inspector and mobile sheet.
 */

export function movieStudioAudioMixerCss() {
	return `
		.movie-audio-mixer {
			display: grid;
			gap: var(--movie-space-3);
			padding-block: var(--movie-space-4);
			border-top: 1px solid var(--movie-divider-subtle);
		}
		.movie-audio-mixer-heading {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--movie-space-2);
		}
		.movie-audio-mixer-heading h3 { margin: 0; }
		.movie-audio-mixer-heading output,
		.movie-audio-selection {
			color: var(--movie-text-muted);
			font-size: 11px;
		}
		.movie-audio-waveform {
			display: block;
			width: 100%;
			height: 120px;
			border: 1px solid var(--movie-border);
			border-radius: var(--movie-radius);
			background: var(--movie-surface-raised);
		}
		.movie-audio-waveform path { fill: var(--movie-track-audio); }
		.movie-audio-controls {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-audio-controls label {
			display: grid;
			gap: var(--movie-space-1);
			min-width: 0;
			color: var(--movie-text-muted);
			font-size: 12px;
		}
		.movie-audio-controls input,
		.movie-audio-actions button {
			width: 100%;
			min-width: 0;
			min-height: var(--movie-touch-height);
		}
		.movie-audio-actions {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: var(--movie-space-2);
		}
		.movie-audio-actions button[aria-pressed="true"] {
			background: var(--movie-warning);
			color: var(--movie-surface-canvas);
		}
		@media (max-width: 720px) {
			.movie-audio-controls,
			.movie-audio-actions { grid-template-columns: 1fr; }
		}
	`;
}
