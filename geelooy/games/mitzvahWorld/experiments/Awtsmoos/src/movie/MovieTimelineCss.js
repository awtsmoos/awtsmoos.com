// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineCss.js
 * @description Defines zoom toolbar, ruler, tracks, clips, trim handles, and playhead.
 * The Awtsmoos renews every cinematic interval beyond the lane; Awtsmoos.com grants
 * each shot a visible duration, movable body, readable label, and precise trim doorway.
 */

export function movieTimelineCss() {
	return `
		.movie-timeline-shell {
			position: relative;
			min-height: 0;
			overflow: auto;
			border-top: 1px solid #31515a;
			background: #061017;
		}
		.movie-timeline-toolbar {
			position: sticky;
			left: 0;
			top: 0;
			z-index: 12;
			width: max-content;
			min-width: 100%;
			padding: 6px 10px;
			background: #0a1b23f5;
		}
		.movie-timeline-toolbar button {
			min-width: 36px;
			min-height: 34px;
		}
		.movie-ruler {
			position: sticky;
			top: 46px;
			z-index: 8;
			height: 28px;
			margin-left: 130px;
			background: repeating-linear-gradient(90deg, #17303a 0 1px, transparent 1px 60px), #091820;
			color: #9bc7ca;
		}
		.movie-ruler span {
			position: absolute;
			top: 6px;
		}
		.movie-track {
			position: relative;
			display: grid;
			grid-template-columns: 130px 1fr;
			min-height: 34px;
			border-top: 1px solid #ffffff12;
		}
		.movie-track-label {
			position: sticky;
			left: 0;
			z-index: 7;
			padding: 8px 9px;
			background: #0b1c24;
			color: #bdecec;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.movie-track-lane {
			position: relative;
			min-width: 900px;
		}
		.movie-clip {
			position: absolute;
			top: 4px;
			display: grid;
			grid-template-columns: 7px minmax(0, 1fr) 7px;
			align-items: center;
			height: 26px;
			border: 1px solid #ffffff4d;
			border-radius: 7px;
			color: #fff;
			overflow: hidden;
			box-sizing: border-box;
			font-size: 10px;
			cursor: grab;
			touch-action: none;
		}
		.movie-clip span {
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
		.movie-clip i {
			height: 100%;
			background: #ffffff26;
			cursor: ew-resize;
		}
		.movie-playhead {
			position: absolute;
			top: 46px;
			bottom: 0;
			z-index: 10;
			width: 2px;
			background: #ffe064;
			box-shadow: 0 0 8px #ffe064;
			pointer-events: none;
		}
	`;
}
