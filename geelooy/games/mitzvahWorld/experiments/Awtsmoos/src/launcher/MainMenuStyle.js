// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuStyle.js
 * @description Installs the cinematic, high-performance entrance to Mitzvah World.
 * The Awtsmoos renews the doorway before the traveler enters; Awtsmoos.com lets gold,
 * mountain mist, glass, and readable motion reveal one finite portal without heavy effects.
 */

const STYLE_ID = 'Awtsmoos-world-browser-style';

export function installMainMenuStyle() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = createMainMenuCss();
	document.head.appendChild(style);
}

function createMainMenuCss() {
	return `
		:root {
			--menu-gold: #f4c66a;
			--menu-gold-bright: #ffe6a2;
			--menu-ink: #07100f;
			--menu-glass: rgba(8, 19, 18, 0.82);
			--menu-line: rgba(244, 198, 106, 0.36);
			--menu-text: #fff8df;
			--menu-muted: #c8d9d2;
		}
		.Awtsmoos-menu {
			position: fixed;
			inset: 0;
			z-index: 1000;
			overflow: auto;
			color: var(--menu-text);
			background:
				linear-gradient(180deg, rgba(3, 8, 12, 0.08), rgba(3, 8, 8, 0.9)),
				radial-gradient(circle at 20% 5%, #d08a3a 0, #315452 22%, #0a1b1a 58%, #020706 100%);
			font-family: Inter, ui-sans-serif, system-ui, sans-serif;
			isolation: isolate;
		}
		.Awtsmoos-menu::before,
		.Awtsmoos-menu::after {
			content: "";
			position: fixed;
			inset: 0;
			pointer-events: none;
		}
		.Awtsmoos-menu::before {
			z-index: -2;
			opacity: 0.42;
			background:
				linear-gradient(118deg, rgba(255, 218, 132, 0.5), transparent 26%),
				repeating-linear-gradient(105deg, transparent 0 72px, rgba(255, 225, 145, 0.06) 74px 78px, transparent 80px 152px);
		}
		.Awtsmoos-menu::after {
			z-index: -1;
			background: linear-gradient(180deg, transparent 0 55%, rgba(2, 7, 6, 0.48) 100%);
		}
		.Awtsmoos-menu-bar {
			position: sticky;
			top: 0;
			z-index: 5;
			display: flex;
			align-items: center;
			gap: 14px;
			min-height: 68px;
			padding: 10px 18px;
			background: rgba(3, 11, 10, 0.76);
			border-bottom: 1px solid var(--menu-line);
			backdrop-filter: blur(18px) saturate(1.15);
		}
		.Awtsmoos-menu-bar button,
		.Awtsmoos-world-card button,
		.Awtsmoos-menu-action {
			border: 1px solid rgba(244, 198, 106, 0.58);
			background: linear-gradient(180deg, #4b3418, #26180d);
			color: #fff3cf;
			box-shadow: inset 0 1px rgba(255, 255, 255, 0.12), 0 10px 28px rgba(0, 0, 0, 0.24);
			cursor: pointer;
			transition: transform 120ms ease, border-color 120ms ease, filter 120ms ease;
		}
		.Awtsmoos-menu-bar button:hover,
		.Awtsmoos-world-card button:hover,
		.Awtsmoos-menu-action:hover {
			transform: translateY(-1px);
			border-color: var(--menu-gold-bright);
			filter: brightness(1.08);
		}
		.Awtsmoos-menu-bar button {
			width: 46px;
			height: 44px;
			border-radius: 14px;
			font-size: 22px;
		}
		.Awtsmoos-menu-bar h1 {
			margin: 0;
			font: 600 clamp(20px, 4vw, 34px) Georgia, serif;
			letter-spacing: 0.035em;
		}
		.Awtsmoos-menu-bar output {
			margin-left: auto;
			color: var(--menu-gold-bright);
			font-size: 13px;
		}
		.Awtsmoos-menu-drawer {
			position: fixed;
			left: 0;
			top: 69px;
			bottom: 0;
			z-index: 6;
			width: min(300px, 84vw);
			padding: 18px;
			background: rgba(4, 13, 12, 0.97);
			border-right: 1px solid var(--menu-line);
			box-shadow: 18px 0 60px rgba(0, 0, 0, 0.45);
			transform: translateX(-104%);
			transition: transform 180ms ease;
		}
		.Awtsmoos-menu[data-drawer="true"] .Awtsmoos-menu-drawer {
			transform: translateX(0);
		}
		.Awtsmoos-menu-drawer button {
			width: 100%;
			margin: 5px 0;
			padding: 14px;
			border: 1px solid rgba(244, 198, 106, 0.22);
			border-radius: 12px;
			background: rgba(255, 255, 255, 0.035);
			color: #fce8bd;
			text-align: left;
			font-weight: 750;
		}
		.Awtsmoos-menu-content {
			position: relative;
			width: min(1180px, 94vw);
			margin: 0 auto;
			padding: 46px 0 74px;
		}
		.Awtsmoos-menu-hero {
			max-width: 820px;
			margin-bottom: 30px;
		}
		.Awtsmoos-menu-hero h2 {
			margin: 0 0 16px;
			color: #fff0bd;
			font: 600 clamp(42px, 8vw, 86px) / 0.92 Georgia, serif;
			letter-spacing: -0.035em;
			text-shadow: 0 8px 36px rgba(0, 0, 0, 0.58);
		}
		.Awtsmoos-menu-hero p {
			max-width: 690px;
			color: #d9e7e1;
			font-size: clamp(15px, 2vw, 18px);
			line-height: 1.6;
		}
		.Awtsmoos-player-name {
			display: flex;
			gap: 10px;
			max-width: 560px;
			margin: 22px 0;
		}
		.Awtsmoos-player-name input {
			flex: 1;
			min-width: 0;
			padding: 14px 16px;
			border: 1px solid rgba(244, 198, 106, 0.48);
			border-radius: 14px;
			background: rgba(5, 15, 14, 0.84);
			color: white;
			font: inherit;
			box-shadow: inset 0 1px rgba(255, 255, 255, 0.05);
		}
		.Awtsmoos-world-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 16px;
		}
		.Awtsmoos-world-card {
			display: flex;
			min-height: 220px;
			flex-direction: column;
			padding: 20px;
			border: 1px solid rgba(244, 198, 106, 0.26);
			border-radius: 20px;
			background: linear-gradient(155deg, rgba(30, 42, 35, 0.92), rgba(5, 14, 13, 0.94));
			box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
			content-visibility: auto;
			contain-intrinsic-size: 220px;
		}
		.Awtsmoos-world-card[data-mode="singlePlayer"] {
			border-color: rgba(244, 198, 106, 0.76);
			background: linear-gradient(150deg, rgba(88, 58, 24, 0.94), rgba(11, 31, 27, 0.95));
		}
		.Awtsmoos-world-card h3 {
			margin: 0 0 8px;
			color: var(--menu-gold-bright);
			font: 600 22px Georgia, serif;
		}
		.Awtsmoos-world-card p {
			color: var(--menu-muted);
			font-size: 14px;
			line-height: 1.5;
		}
		.Awtsmoos-world-meta {
			display: flex;
			justify-content: space-between;
			gap: 8px;
			margin-top: auto;
			color: #a8ddc7;
			font-size: 12px;
		}
		.Awtsmoos-world-card button,
		.Awtsmoos-menu-action {
			margin-top: 15px;
			padding: 13px 14px;
			border-radius: 12px;
			font-weight: 800;
		}
		.Awtsmoos-world-card button:disabled {
			opacity: 0.42;
			cursor: not-allowed;
			transform: none;
		}
		.Awtsmoos-tag-list {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;
		}
		.Awtsmoos-tag {
			padding: 4px 8px;
			border: 1px solid rgba(255, 255, 255, 0.06);
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.05);
			font-size: 10px;
		}
		.Awtsmoos-menu-status {
			min-height: 24px;
			margin: 18px 0;
			color: #ffd987;
			font-size: 14px;
		}
		.Awtsmoos-menu-actions {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
			gap: 14px;
		}
		.Awtsmoos-menu-action {
			min-height: 112px;
			text-align: left;
			font-size: 18px;
		}
		.Awtsmoos-menu-action small {
			display: block;
			margin-top: 8px;
			color: var(--menu-muted);
			font-size: 12px;
		}
		.Awtsmoos-menu button:focus-visible,
		.Awtsmoos-menu input:focus-visible {
			outline: 3px solid #ffe08a;
			outline-offset: 3px;
		}
		@media (max-width: 620px) {
			.Awtsmoos-menu-bar output {
				display: none;
			}
			.Awtsmoos-menu-content {
				padding-top: 28px;
			}
			.Awtsmoos-player-name {
				flex-direction: column;
			}
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-menu *,
			.Awtsmoos-menu *::before,
			.Awtsmoos-menu *::after {
				scroll-behavior: auto !important;
				transition-duration: 0.001ms !important;
			}
		}
	`;
}
