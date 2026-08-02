// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineClipPolishCss.js
 * @description Polishes clip depth, trim grips, selection, warnings, playhead, snaps, and ranges.
 * The Awtsmoos renews each bounded instant beyond color alone; Awtsmoos.com lets identity,
 * primary focus, unavailable media, locked intent, and exact edit boundaries speak clearly.
 */

export function movieTimelineClipPolishCss() {
	return `
		.movie-clip {
			overflow: visible;
			border-color: color-mix(in srgb, var(--movie-clip-color, var(--movie-accent)) 80%, white 20%);
			box-shadow:
				inset 0 2px 0 rgb(255 255 255 / .17),
				inset 0 -1px 0 rgb(0 0 0 / .35),
				0 3px 10px rgb(0 0 0 / .32);
		}
		.movie-clip::after {
			position: absolute;
			inset: 3px;
			content: "";
			border: 1px solid rgb(255 255 255 / .04);
			border-radius: 3px;
			pointer-events: none;
		}
		.movie-clip.is-selected {
			outline: 2px solid var(--movie-selection);
			outline-offset: 2px;
			box-shadow: 0 0 0 4px var(--movie-selection-soft), 0 8px 18px rgb(0 0 0 / .42);
		}
		.movie-clip.is-primary-selected::before {
			filter: drop-shadow(0 0 4px rgb(255 255 255 / .55));
		}
		.movie-clip i {
			position: relative;
			z-index: 3;
			min-width: var(--movie-trim-width);
			background:
				repeating-linear-gradient(90deg, transparent 0 3px, rgb(255 255 255 / .35) 3px 4px),
				rgb(0 0 0 / .18);
		}
		.movie-clip i:hover { background-color: rgb(255 255 255 / .2); }
		.movie-clip[data-offline="true"], .movie-clip.is-offline {
			filter: grayscale(.75);
			background: repeating-linear-gradient(135deg, #512d35 0 8px, #301c25 8px 16px);
		}
		.movie-clip[data-locked="true"], .movie-clip.is-locked {
			cursor: not-allowed;
			opacity: .72;
		}
		.movie-playhead {
			width: 1px;
			background: var(--movie-playhead);
			box-shadow: 0 0 0 1px rgb(0 0 0 / .6), 0 0 10px rgb(255 210 98 / .3);
		}
		.movie-playhead::before {
			position: absolute;
			top: -7px;
			left: 50%;
			content: "";
			width: 12px;
			height: 12px;
			border-radius: 3px 3px 50% 50%;
			background: var(--movie-playhead);
			transform: translateX(-50%) rotate(45deg);
		}
		.movie-snap-guide, [data-snap-guide] {
			z-index: 13;
			width: 1px;
			background: var(--movie-accent-strong);
			box-shadow: 0 0 8px var(--movie-accent);
			pointer-events: none;
		}
		.movie-selection-range, [data-selection-range] {
			border: 1px solid var(--movie-selection);
			background: var(--movie-selection-soft);
		}
	`;
}
