// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos clothes storage and tunnel presence in one compact OS crown.
 * Color is reinforced by text and data attributes throughout Awtsmoos.com.
 */

export function osStatusStyles() {
	return `
		.awtsmoos-status-pill {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			min-height: 44px;
			border: 1px solid rgba(125, 211, 252, .35);
			border-radius: 999px;
			background: rgba(8, 20, 34, .78);
			color: #dff6ff;
			padding: 6px 12px;
			box-shadow: 0 0 18px rgba(14, 165, 233, .18);
			backdrop-filter: blur(12px);
			cursor: pointer;
		}
		.awtsmoos-status-pill:focus-visible {
			outline: 3px solid #7dd3fc;
			outline-offset: 3px;
		}
		.awtsmoos-status-pill .status-copy {
			display: grid;
			gap: 1px;
			text-align: left;
		}
		.awtsmoos-status-pill strong { font-size: 12px; }
		.awtsmoos-status-pill small { opacity: .78; font-size: 10px; }
		.awtsmoos-status-pill .status-dot {
			width: 9px;
			height: 9px;
			border-radius: 999px;
			background: #94a3b8;
			box-shadow: 0 0 10px currentColor;
		}
		.awtsmoos-status-pill[data-tunnel-state=online] .status-dot { background: #22c55e; }
		.awtsmoos-status-pill[data-tunnel-state=connecting] .status-dot,
		.awtsmoos-status-pill[data-tunnel-state=reconnecting] .status-dot { background: #f59e0b; }
		.awtsmoos-status-pill[data-tunnel-state=failed] .status-dot { background: #fb7185; }
		.awtsmoos-status-pill[data-remote=needs-login] { border-color: rgba(245, 158, 11, .6); }
	`;
}
