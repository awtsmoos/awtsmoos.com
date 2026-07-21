// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayUiStyles.js
 * @description Installs a unified cinematic gameplay interface for NPCs, quests, maps, Torah, and panels.
 * The Awtsmoos renews every meeting and mission through clear finite vessels; Awtsmoos.com keeps
 * the interface rich, readable, responsive, and restrained enough to preserve the seventeen-ms world.
 */

const STYLE_ID = 'Awtsmoos-gameplay-ui-style';

export function installGameplayUiStyles() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = createGameplayCss();
	document.head.appendChild(style);
}

function createGameplayCss() {
	return `
		:root {
			--ui-gold: #f2c66f;
			--ui-gold-bright: #ffe6a5;
			--ui-ink: #07110f;
			--ui-panel: rgba(7, 17, 15, 0.94);
			--ui-panel-soft: rgba(15, 31, 27, 0.9);
			--ui-line: rgba(242, 198, 111, 0.34);
			--ui-text: #f6f2e8;
			--ui-muted: #b9cbc4;
			--ui-danger: #e46f5f;
			--ui-success: #7bd7a9;
		}
		.Awtsmoos-gameplay,
		.Awtsmoos-gameplay button,
		.Awtsmoos-gameplay input {
			font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		}
		.Awtsmoos-gameplay button {
			border: 1px solid rgba(242, 198, 111, 0.46);
			border-radius: 11px;
			background: linear-gradient(180deg, #493116, #25180c);
			color: #fff0c7;
			font-weight: 800;
			cursor: pointer;
			transition: transform 120ms ease, border-color 120ms ease, filter 120ms ease;
		}
		.Awtsmoos-gameplay button:hover {
			transform: translateY(-1px);
			border-color: var(--ui-gold-bright);
			filter: brightness(1.08);
		}
		.Awtsmoos-gameplay button:focus-visible,
		.Awtsmoos-gameplay [tabindex]:focus-visible {
			outline: 3px solid #ffe08a;
			outline-offset: 3px;
		}
		.Awtsmoos-modal-backdrop {
			position: fixed;
			inset: 0;
			z-index: 910;
			display: grid;
			place-items: center;
			padding: 16px;
			background: rgba(2, 5, 4, 0.72);
			backdrop-filter: blur(10px);
		}
		.Awtsmoos-modal-backdrop[hidden] {
			display: none;
		}
		.Awtsmoos-quest-offer,
		.Awtsmoos-quest-log,
		.Awtsmoos-torah-library {
			border: 1px solid var(--ui-line);
			background: linear-gradient(150deg, rgba(27, 35, 28, 0.97), rgba(6, 14, 12, 0.98));
			color: var(--ui-text);
			box-shadow: 0 26px 90px rgba(0, 0, 0, 0.52), inset 0 1px rgba(255, 255, 255, 0.06);
		}
		.Awtsmoos-quest-offer {
			width: min(620px, 94vw);
			max-height: 88vh;
			overflow: auto;
			padding: 28px;
			border-radius: 24px;
			font-size: 15px;
			line-height: 1.6;
		}
		.Awtsmoos-quest-offer h2,
		.Awtsmoos-panel-header h2 {
			margin: 0;
			color: var(--ui-gold-bright);
			font-family: Georgia, serif;
		}
		.Awtsmoos-quest-offer h2 {
			font-size: clamp(30px, 6vw, 42px);
		}
		.Awtsmoos-quest-offer .giver {
			color: #9fd9c0;
		}
		.Awtsmoos-objectives {
			padding-left: 22px;
		}
		.Awtsmoos-objectives li {
			margin: 8px 0;
		}
		.Awtsmoos-offer-actions {
			display: flex;
			justify-content: flex-end;
			gap: 10px;
		}
		.Awtsmoos-offer-actions button,
		.Awtsmoos-quest-button {
			padding: 11px 15px;
		}
		.Awtsmoos-quest-log,
		.Awtsmoos-torah-library {
			position: fixed;
			inset: 7vh 7vw;
			z-index: 890;
			overflow: auto;
			padding: 20px;
			border-radius: 22px;
			content-visibility: auto;
		}
		.Awtsmoos-quest-log[hidden],
		.Awtsmoos-torah-library[hidden] {
			display: none;
		}
		.Awtsmoos-panel-header {
			position: sticky;
			top: 0;
			z-index: 2;
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 0 14px;
			background: linear-gradient(180deg, #0a1614 70%, transparent);
		}
		.Awtsmoos-panel-header button {
			margin-left: auto;
		}
		.Awtsmoos-quest-tabs {
			display: flex;
			gap: 7px;
			overflow: auto;
			margin: 10px 0 14px;
		}
		.Awtsmoos-quest-tabs button {
			padding: 8px 12px;
			border-color: rgba(126, 166, 150, 0.38);
			border-radius: 999px;
			background: rgba(22, 43, 36, 0.86);
			color: #d8e8e1;
		}
		.Awtsmoos-quest-tabs button[aria-selected="true"] {
			border-color: var(--ui-gold);
			background: #3b2914;
			color: var(--ui-gold-bright);
		}
		.Awtsmoos-quest-card {
			margin: 9px 0;
			padding: 15px;
			border: 1px solid rgba(116, 151, 137, 0.28);
			border-radius: 14px;
			background: linear-gradient(145deg, rgba(18, 35, 30, 0.94), rgba(9, 22, 19, 0.94));
		}
		.Awtsmoos-quest-card h3 {
			margin: 0 0 6px;
			color: #f4d18c;
		}
		.Awtsmoos-quest-card footer {
			display: flex;
			flex-wrap: wrap;
			gap: 7px;
		}
		.Awtsmoos-progress {
			height: 8px;
			overflow: hidden;
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.08);
		}
		.Awtsmoos-progress span {
			display: block;
			height: 100%;
			background: linear-gradient(90deg, #bd8431, #f5d07b, #fff0b5);
		}
		.Awtsmoos-quest-tracker {
			position: fixed;
			top: 78px;
			right: 14px;
			z-index: 720;
			width: min(310px, 42vw);
			padding: 11px;
			border: 1px solid var(--ui-line);
			border-radius: 15px;
			background: var(--ui-panel);
			color: var(--ui-text);
			box-shadow: 0 14px 38px rgba(0, 0, 0, 0.28);
			font-size: 12px;
			backdrop-filter: blur(10px);
		}
		.Awtsmoos-quest-tracker[hidden] {
			display: none;
		}
		.Awtsmoos-tracked-quest {
			margin: 6px 0;
			padding: 8px;
			border-radius: 9px;
			background: rgba(255, 255, 255, 0.045);
		}
		.Awtsmoos-tracked-quest b {
			color: #ffd47e;
		}
		.Awtsmoos-minimap {
			position: fixed;
			right: 14px;
			bottom: 14px;
			z-index: 710;
			width: 220px;
			overflow: hidden;
			border: 1px solid var(--ui-line);
			border-radius: 16px;
			background: var(--ui-panel);
			color: white;
			box-shadow: 0 16px 46px rgba(0, 0, 0, 0.34);
		}
		.Awtsmoos-minimap[data-expanded="true"] {
			right: 4vw;
			bottom: 8vh;
			z-index: 900;
			width: min(720px, 92vw);
			height: min(620px, 82vh);
		}
		.Awtsmoos-minimap header {
			display: flex;
			align-items: center;
			padding: 8px 10px;
		}
		.Awtsmoos-minimap header button {
			margin-left: auto;
		}
		.Awtsmoos-map-canvas {
			position: relative;
			aspect-ratio: 1;
			overflow: hidden;
			background: radial-gradient(circle at 46% 43%, #4d6e50, #1a3128 48%, #0b1814 72%);
		}
		.Awtsmoos-map-canvas::before {
			content: "";
			position: absolute;
			inset: 0;
			background:
				linear-gradient(120deg, transparent 44%, rgba(125, 182, 186, 0.5) 45% 48%, transparent 49%),
				radial-gradient(ellipse at 40% 53%, rgba(83, 127, 164, 0.48) 0 12%, transparent 13%);
		}
		.Awtsmoos-map-marker,
		.Awtsmoos-map-player {
			position: absolute;
			transform: translate(-50%, -50%);
		}
		.Awtsmoos-map-marker {
			border: 0;
			background: transparent;
			font-size: 18px;
			filter: drop-shadow(0 2px 2px #000);
		}
		.Awtsmoos-map-player {
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background: #66e4ff;
			box-shadow: 0 0 10px #55dfff;
		}
		.Awtsmoos-book-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 11px;
		}
		.Awtsmoos-book {
			padding: 14px;
			border: 1px solid rgba(242, 198, 111, 0.2);
			border-radius: 14px;
			background: rgba(28, 22, 16, 0.9);
		}
		.Awtsmoos-passage {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 8px;
			margin: 7px 0;
			padding: 10px;
			border-radius: 9px;
			background: rgba(255, 255, 255, 0.045);
		}
		.Awtsmoos-passage small {
			color: #d3c096;
		}
		.Awtsmoos-status-dock {
			position: fixed;
			left: 18px;
			bottom: 18px;
			z-index: 735;
			display: grid;
			gap: 9px;
			width: min(350px, calc(100vw - 36px));
			pointer-events: none;
		}
		.Awtsmoos-status-dock .status-card {
			display: grid;
			grid-template-columns: 54px 1fr auto;
			align-items: center;
			gap: 12px;
			padding: 12px 14px;
			border: 1px solid var(--ui-line);
			border-radius: 17px;
			background: linear-gradient(145deg, rgba(13, 29, 25, 0.94), rgba(5, 14, 12, 0.96));
			color: var(--ui-text);
			box-shadow: 0 16px 42px rgba(0, 0, 0, 0.36), inset 0 1px rgba(255, 255, 255, 0.06);
			backdrop-filter: blur(12px);
			contain: content;
		}
		.Awtsmoos-status-dock .target-card {
			border-color: rgba(242, 198, 111, 0.58);
			background: linear-gradient(145deg, rgba(53, 37, 17, 0.94), rgba(16, 22, 18, 0.97));
		}
		.Awtsmoos-status-dock .status-face {
			display: grid;
			place-items: center;
			width: 50px;
			height: 50px;
			border: 1px solid rgba(242, 198, 111, 0.36);
			border-radius: 15px;
			background: rgba(255, 255, 255, 0.055);
			font-size: 28px;
		}
		.Awtsmoos-status-dock b,
		.Awtsmoos-status-dock small,
		.Awtsmoos-status-dock label {
			display: block;
		}
		.Awtsmoos-status-dock b {
			color: #fff0c6;
			font-size: 14px;
		}
		.Awtsmoos-status-dock small,
		.Awtsmoos-status-dock label {
			margin-top: 2px;
			color: var(--ui-muted);
			font-size: 10px;
		}
		.Awtsmoos-status-dock meter,
		.Awtsmoos-status-dock progress {
			display: block;
			width: 100%;
			height: 7px;
			margin-top: 5px;
			accent-color: var(--ui-success);
		}
		.Awtsmoos-status-dock .target-card meter {
			accent-color: var(--ui-danger);
		}
		.Awtsmoos-status-dock article > strong {
			color: var(--ui-gold-bright);
			font: 700 18px Georgia, serif;
		}
		.Awtsmoos-npc-dialogue {
			position: fixed;
			left: 50%;
			bottom: 28px;
			z-index: 820;
			width: min(640px, calc(100vw - 28px));
			transform: translate(-50%, 18px);
			opacity: 0;
			pointer-events: none;
			transition: transform 160ms ease, opacity 160ms ease;
		}
		.Awtsmoos-npc-dialogue[data-open="true"] {
			transform: translate(-50%, 0);
			opacity: 1;
			pointer-events: auto;
		}
		.Awtsmoos-npc-dialogue section {
			padding: 20px;
			border: 1px solid rgba(242, 198, 111, 0.58);
			border-radius: 20px;
			background: linear-gradient(150deg, rgba(31, 36, 27, 0.98), rgba(6, 14, 12, 0.98));
			color: var(--ui-text);
			box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5), inset 0 1px rgba(255, 255, 255, 0.06);
		}
		.Awtsmoos-npc-dialogue header {
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.Awtsmoos-npc-dialogue header b {
			color: var(--ui-gold-bright);
			font: 600 22px Georgia, serif;
		}
		.Awtsmoos-npc-dialogue header button {
			margin-left: auto;
			width: 38px;
			height: 38px;
		}
		.Awtsmoos-npc-dialogue p {
			color: #d6e3dd;
			line-height: 1.58;
		}
		.Awtsmoos-npc-dialogue section > button {
			margin: 6px 7px 0 0;
			padding: 10px 13px;
		}
		.Awtsmoos-golden-marker {
			position: fixed;
			z-index: 650;
			color: #ffd353;
			font: 700 34px Georgia, serif;
			text-shadow: 0 0 8px #ffb300, 0 3px 3px #000;
			animation: AwtsmoosMarker 1.2s ease-in-out infinite alternate;
		}
		@keyframes AwtsmoosMarker {
			to {
				transform: translateY(-8px);
				filter: brightness(1.25);
			}
		}
		@media (max-width: 650px) {
			.Awtsmoos-quest-log,
			.Awtsmoos-torah-library {
				inset: 3vh 3vw;
			}
			.Awtsmoos-quest-tracker {
				top: 68px;
				right: 8px;
				width: 56vw;
			}
			.Awtsmoos-minimap {
				right: 8px;
				bottom: 82px;
				width: 150px;
			}
			.Awtsmoos-status-dock {
				left: 8px;
				bottom: 82px;
				width: min(310px, calc(100vw - 16px));
			}
			.Awtsmoos-npc-dialogue {
				bottom: 12px;
			}
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-gameplay *,
			.Awtsmoos-gameplay *::before,
			.Awtsmoos-gameplay *::after {
				animation-duration: 0.001ms !important;
				transition-duration: 0.001ms !important;
			}
		}
	`;
}
