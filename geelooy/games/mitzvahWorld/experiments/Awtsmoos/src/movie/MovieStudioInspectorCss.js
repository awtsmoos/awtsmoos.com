// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInspectorCss.js
 * @description Defines toolbar, transform, JSON, and status styling for the NLE inspector.
 * The Awtsmoos renews every editing decision beyond fields; Awtsmoos.com gives each
 * numeric channel, action, and project document a readable and touch-safe vessel.
 */

export function movieStudioInspectorCss() {
	return `
		.movie-inspector {
			min-height: 0;
			display: grid;
			grid-template-rows: auto auto minmax(80px, auto) minmax(80px, 1fr) auto;
			gap: 9px;
			padding: 12px;
			border: 1px solid #315b67;
			border-radius: 16px;
			background: #09151bf2;
			overflow: auto;
			backdrop-filter: blur(14px);
		}
		.movie-inspector h2,
		.movie-inspector p {
			margin: 0;
		}
		.movie-inspector h2 {
			color: #fff0ad;
			font-size: 18px;
		}
		.movie-inspector p {
			color: #8dc7ce;
		}
		.movie-toolbar,
		.movie-timeline-toolbar {
			display: flex;
			gap: 7px;
			align-items: center;
			flex-wrap: wrap;
		}
		.movie-toolbar button,
		.movie-timeline-toolbar button,
		.movie-transform-inspector button {
			min-width: 44px;
			min-height: 44px;
			border: 1px solid #4b8694;
			border-radius: 10px;
			background: #12323d;
			color: #fff;
			font: 700 12px system-ui;
			cursor: pointer;
		}
		.movie-toolbar button[data-render] {
			background: #725416;
			color: #fff1be;
		}
		.movie-toolbar button:disabled {
			opacity: 0.45;
		}
		.movie-transform-inspector {
			padding: 10px;
			border: 1px solid #274651;
			border-radius: 12px;
			background: #050d11;
			overflow: auto;
		}
		.movie-transform-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 7px;
			margin: 8px 0;
		}
		.movie-transform-grid label {
			display: grid;
			gap: 3px;
			color: #a7d3d6;
			font-size: 11px;
		}
		.movie-transform-grid input,
		.movie-transform-grid select,
		.movie-json {
			box-sizing: border-box;
			width: 100%;
			border: 1px solid #31515a;
			border-radius: 8px;
			background: #02070a;
			color: #d6fff7;
			padding: 8px;
		}
		.movie-json-disclosure {
			min-height: 0;
			overflow: auto;
		}
		.movie-json-disclosure summary {
			padding: 7px 0;
			color: #9cd4dc;
			cursor: pointer;
		}
		.movie-json {
			min-height: 150px;
			resize: vertical;
			font: 11px/1.45 ui-monospace, monospace;
			user-select: text;
		}
		.movie-status {
			min-height: 20px;
			color: #9fffe7;
		}
	`;
}
