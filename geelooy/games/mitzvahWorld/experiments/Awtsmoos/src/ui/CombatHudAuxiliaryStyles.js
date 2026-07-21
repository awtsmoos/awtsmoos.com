// B"H
// Boruch Hashem
// Blessed is He

/** @file CombatHudAuxiliaryStyles.js @description Cast, tooltip, status, and feedback CSS. */

export const COMBAT_HUD_AUXILIARY_CSS = `
.Mitzvah-combat-host [hidden] {
	display: none !important;
}

.Mitzvah-castbar {
	background: linear-gradient(180deg, rgba(34, 39, 35, .96), rgba(15, 16, 14, .98));
	border: 1px solid rgba(229, 195, 111, .64);
	border-radius: 7px;
	bottom: calc(100% + 8px);
	box-shadow: 0 5px 18px rgba(0, 0, 0, .42);
	color: #fff2cb;
	display: grid;
	font: 700 12px/1.2 ui-sans-serif, system-ui, sans-serif;
	grid-template-columns: 1fr auto;
	left: 50%;
	overflow: hidden;
	padding: 7px 9px 8px;
	position: absolute;
	transform: translateX(-50%);
	width: min(360px, 76vw);
}

.Mitzvah-castbar-time {
	color: #bde7e6;
	font-variant-numeric: tabular-nums;
}

.Mitzvah-castbar-fill {
	background: linear-gradient(90deg, #4da1a1, #f0ce6c);
	bottom: 0;
	height: 3px;
	left: 0;
	position: absolute;
	right: 0;
	transform: scaleX(0);
	transform-origin: left center;
}

.Mitzvah-castbar[data-phase="channeling"] .Mitzvah-castbar-fill {
	background: linear-gradient(90deg, #8abfd1, #d8ecff);
}

.Mitzvah-status-effects {
	bottom: calc(100% + 46px);
	display: flex;
	gap: 5px;
	left: 50%;
	pointer-events: auto;
	position: absolute;
	transform: translateX(-50%);
}

.Mitzvah-status-effect {
	background: linear-gradient(145deg, #365a59, #172322);
	border: 1px solid rgba(219, 239, 209, .58);
	border-radius: 6px;
	box-shadow: 0 3px 9px rgba(0, 0, 0, .38);
	color: #f3ffe7;
	display: grid;
	height: 32px;
	place-items: center;
	position: relative;
	width: 32px;
}

.Mitzvah-status-effect b {
	font: 800 8px/1 ui-sans-serif, system-ui, sans-serif;
	max-width: 28px;
	overflow: hidden;
	text-overflow: clip;
	text-transform: uppercase;
}

.Mitzvah-status-effect small {
	background: rgba(0, 0, 0, .72);
	bottom: 0;
	font: 800 9px/1 ui-monospace, monospace;
	padding: 1px 2px;
	position: absolute;
	right: 0;
}

.Mitzvah-status-effect::after {
	content: attr(data-stacks);
	font: 900 10px/1 ui-sans-serif, system-ui, sans-serif;
	left: 2px;
	position: absolute;
	top: 2px;
}

.Mitzvah-ability-tooltip {
	background: linear-gradient(145deg, rgba(32, 28, 21, .98), rgba(13, 20, 19, .98));
	border: 1px solid rgba(232, 195, 105, .72);
	border-radius: 9px;
	box-shadow: 0 12px 28px rgba(0, 0, 0, .52);
	color: #eee6d1;
	left: var(--tooltip-x);
	max-width: min(330px, 88vw);
	padding: 12px;
	pointer-events: none;
	position: fixed;
	top: var(--tooltip-y);
	transform: translate(-50%, -100%);
	z-index: 900;
}

.Mitzvah-tooltip-heading {
	color: #ffe49a;
	font: 800 16px/1.2 Georgia, serif;
	margin: 0 0 2px;
}

.Mitzvah-tooltip-school {
	color: #9cd7d5;
	font: 800 10px/1.2 ui-sans-serif, system-ui, sans-serif;
	letter-spacing: .1em;
	margin: 0 0 8px;
	text-transform: uppercase;
}

.Mitzvah-tooltip-description {
	font: 12px/1.45 ui-sans-serif, system-ui, sans-serif;
	margin: 0 0 9px;
}

.Mitzvah-tooltip-stats {
	display: grid;
	font: 11px/1.3 ui-sans-serif, system-ui, sans-serif;
	grid-template-columns: auto 1fr;
	margin: 0;
}

.Mitzvah-tooltip-term,
.Mitzvah-tooltip-value {
	margin: 0;
	padding: 1px 0;
}

.Mitzvah-tooltip-value {
	color: #dcebea;
	text-align: right;
}

.Mitzvah-tooltip-ready,
.Mitzvah-tooltip-unavailable {
	font: 800 11px/1.2 ui-sans-serif, system-ui, sans-serif;
	margin: 9px 0 0;
	text-transform: capitalize;
}

.Mitzvah-tooltip-ready { color: #8ff0d7; }
.Mitzvah-tooltip-unavailable { color: #f1a69f; }

.Mitzvah-action-feedback {
	color: #f7e1a6;
	font: 800 11px/1.2 ui-sans-serif, system-ui, sans-serif;
	left: 50%;
	pointer-events: none;
	position: absolute;
	top: -24px;
	transform: translateX(-50%);
	white-space: nowrap;
}

@media (max-width: 600px) {
	.Mitzvah-ability-tooltip {
		max-width: calc(100vw - 20px);
	}

	.Mitzvah-status-effects {
		bottom: calc(100% + 40px);
	}
}

@media (prefers-contrast: more) {
	.Mitzvah-combat-frame,
	.Mitzvah-action-slot,
	.Mitzvah-castbar,
	.Mitzvah-ability-tooltip {
		border-color: #fff2b6;
	}
}
`;
