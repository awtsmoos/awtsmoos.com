// B"H
// Boruch Hashem
// Blessed is He

/** @file ActionBarLayoutStyles.js @description Responsive combat-bar frame and layout CSS. */

export const ACTION_BAR_LAYOUT_CSS = `
.Mitzvah-combat-host {
	--bar-gold: #e3b85e;
	--bar-stone: #252925;
	--bar-wood: #2d1c12;
	bottom: max(12px, env(safe-area-inset-bottom));
	contain: layout style;
	left: 50%;
	pointer-events: none;
	position: fixed;
	transform: translateX(-50%);
	width: min(94vw, 940px);
	z-index: 310;
}

.Mitzvah-combat-frame {
	background:
		linear-gradient(180deg, rgba(255, 226, 157, .09), transparent 28%),
		linear-gradient(135deg, rgba(18, 21, 19, .96), rgba(46, 28, 17, .96));
	border: 1px solid rgba(227, 184, 94, .52);
	border-radius: 12px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, .45), inset 0 0 0 2px rgba(0, 0, 0, .42);
	display: grid;
	gap: 5px;
	padding: 7px;
	pointer-events: auto;
	position: relative;
}

.Mitzvah-action-grid {
	display: grid;
	gap: 5px;
	grid-template-columns: repeat(12, minmax(0, 1fr));
}

.Mitzvah-action-grid[data-rows="2"] {
	grid-template-rows: repeat(2, auto);
}

.Mitzvah-action-meta {
	align-items: center;
	display: grid;
	gap: 8px;
	grid-template-columns: minmax(120px, 1fr) auto;
	min-height: 15px;
}

.Mitzvah-focus-track {
	background: rgba(2, 13, 15, .78);
	border: 1px solid rgba(108, 217, 220, .32);
	border-radius: 999px;
	height: 8px;
	overflow: hidden;
	position: relative;
}

.Mitzvah-focus-fill {
	background: linear-gradient(90deg, #3d8e93, #b6ffff 76%, #f5df92);
	box-shadow: 0 0 8px rgba(119, 241, 245, .5);
	height: 100%;
	transform: scaleX(var(--focus-ratio, 1));
	transform-origin: left center;
}

.Mitzvah-focus-label {
	color: #d8fbf8;
	font: 700 10px/1.1 ui-sans-serif, system-ui, sans-serif;
	left: 8px;
	letter-spacing: .04em;
	position: absolute;
	text-shadow: 0 1px 2px #000;
	top: -2px;
}

.Mitzvah-layout-lock {
	background: rgba(18, 16, 12, .74);
	border: 1px solid rgba(227, 184, 94, .38);
	border-radius: 6px;
	color: #ead9b4;
	cursor: pointer;
	font: 700 10px/1 system-ui, sans-serif;
	min-height: 24px;
	padding: 4px 8px;
}

.Mitzvah-layout-lock:focus-visible {
	outline: 2px solid #c9ffff;
	outline-offset: 2px;
}

@media (max-width: 800px) {
	.Mitzvah-combat-host {
		bottom: max(8px, env(safe-area-inset-bottom));
		width: min(98vw, 620px);
	}

	.Mitzvah-action-grid {
		grid-template-columns: repeat(6, minmax(44px, 1fr));
	}

	.Mitzvah-combat-frame {
		border-radius: 10px;
		gap: 4px;
		padding: 5px;
	}
}

@media (max-width: 420px) {
	.Mitzvah-combat-host {
		width: calc(100vw - 8px);
	}

	.Mitzvah-action-grid {
		gap: 3px;
		grid-template-columns: repeat(6, minmax(42px, 1fr));
	}
}

@media (prefers-reduced-motion: reduce) {
	.Mitzvah-combat-host *,
	.Mitzvah-combat-host *::before,
	.Mitzvah-combat-host *::after {
		scroll-behavior: auto !important;
		transition-duration: .001ms !important;
	}
}
`;
