// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelinePerformanceCss.js
 * @description Styles actor-performance curves, event markers, evidence badges, and warning states.
 * The Awtsmoos is beyond speed and facing while each finite take must tell the editor its truth;
 * Awtsmoos.com keeps curves pointer-clear, badges compact, warnings visible, and clips responsive in rhyme.
 */

export function movieTimelinePerformanceCss() {
	return `
		.movie-track[data-type="performance"]{--movie-clip-color:#a23f57}
		.movie-performance-clip{overflow:hidden}
		.movie-performance-clip>.movie-clip-label{position:relative;z-index:5;align-self:start;padding-top:3px;text-shadow:0 1px 2px #000}
		.movie-performance-visual{position:absolute;inset:18px var(--movie-trim-width) 2px;z-index:1;overflow:hidden;pointer-events:none}
		.movie-performance-visual svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
		.movie-performance-visual polyline{fill:none;vector-effect:non-scaling-stroke;stroke-width:1.3}
		.movie-performance-speed polyline{stroke:#91f0ba}.movie-performance-facing polyline{stroke:#cbb5ff;opacity:.72}
		.movie-performance-markers{position:absolute;inset:0}.movie-performance-markers u{position:absolute;top:0;bottom:0;width:1px;text-decoration:none}
		.movie-performance-actions u{background:#ffd166}.movie-performance-animations u{top:55%;background:#6ce5e8}.movie-performance-cameras u{top:28%;background:#d6c2ff}
		.movie-performance-badges{position:absolute;right:calc(var(--movie-trim-width) + 3px);bottom:2px;z-index:6;display:flex;gap:2px;pointer-events:none}
		.movie-performance-badges b{min-width:13px;padding:1px 3px;border-radius:3px;background:#101621cc;color:#eef5ff;font:700 8px/1.2 ui-monospace,monospace;text-align:center}
		.movie-performance-badges .is-warning{background:#7d1f2b;color:#fff0a9}
		.movie-performance-clip[data-preferred="true"]{box-shadow:inset 0 0 0 2px #ffd166,0 2px 8px #0008}
		.movie-performance-clip[data-warning="true"]{border-color:#ff9a5c}
		.movie-performance-clip[data-has-audio="true"]{background-image:linear-gradient(90deg,transparent,#2d864633)}
		.movie-performance-clip[data-has-camera="true"]::after{content:'◉';position:absolute;left:calc(var(--movie-trim-width) + 3px);bottom:1px;z-index:6;color:#d6c2ff;font-size:9px}
		.movie-timeline-shell[data-scale-band="overview"] .movie-performance-badges{display:none}
	`;
}
