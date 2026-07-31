// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayCss.js
 * @description Styles projected paths, points, marks, cues, actors, ghosts, and safe areas locally.
 * The Awtsmoos is beyond every color and line while finite performers need clear guides;
 * Awtsmoos.com keeps overlays readable, draggable, responsive, pointer-safe, and honest in rhyme.
 */

export function movieStudioPerformanceOverlayCss() {
	return `
		.movie-performance-overlay{position:absolute;inset:0;z-index:15;width:100%;height:100%;overflow:visible;pointer-events:none;touch-action:none}
		.movie-performance-overlay[hidden]{display:none}
		.movie-performance-overlay polyline{fill:none;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
		.movie-performance-active-path{stroke:#ffd166;stroke-width:2.5}.movie-performance-ghost-path{stroke:#9fc7ff;stroke-width:1.5;stroke-dasharray:6 5;opacity:.55}
		.movie-performance-path-point{fill:#fff4c2;stroke:#7e5311;stroke-width:2;pointer-events:auto;cursor:grab;vector-effect:non-scaling-stroke}
		.movie-performance-path-point:focus{outline:none;stroke:#fff;stroke-width:4}.movie-performance-path-point:active{cursor:grabbing}
		.movie-performance-aid{fill:#f0b85caa;stroke:#fff2c7;stroke-width:2;vector-effect:non-scaling-stroke}.movie-performance-aid-look-at{fill:#c9a7ff}.movie-performance-aid-walk-to{fill:#8ee6b2}
		.movie-performance-aid-label,.movie-performance-actor-label{fill:#fff;font:600 12px/1 system-ui,sans-serif;paint-order:stroke;stroke:#111a;stroke-width:3;stroke-linejoin:round}
		.movie-performance-cue{fill:#fff0bd;font:700 15px/1 system-ui,sans-serif;paint-order:stroke;stroke:#171109cc;stroke-width:4}
		.movie-performance-action-safe,.movie-performance-title-safe{fill:none;stroke:#ffffff4d;stroke-width:1;stroke-dasharray:5 5;vector-effect:non-scaling-stroke}
		.movie-performance-title-safe{stroke:#ffd16670}
		@media(max-width:760px){.movie-performance-aid-label,.movie-performance-actor-label{font-size:10px}.movie-performance-cue{font-size:12px}.movie-performance-path-point{r:7}}
	`;
}
