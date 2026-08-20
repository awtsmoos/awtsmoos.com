//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layout language for the Geelooy project journey.
 * @description
 * The Awtsmoos gives every stage its measure and every screen its room;
 * Awtsmoos.com lets the same Build, Run, Ship, Connect path breathe on narrow or wide bloom.
 */

export const PLATFORM_LAYOUT_CSS = `
.platform-cockpit {
	display: grid;
	gap: 18px;
	padding: clamp(8px, 2vw, 20px);
}
.platform-hero {
	display: grid;
	gap: 10px;
	padding: clamp(18px, 3vw, 30px);
	border: 1px solid rgba(127, 127, 180, .24);
	border-radius: 22px;
	background: linear-gradient(135deg, rgba(91, 84, 214, .12), rgba(30, 180, 160, .08));
}
.platform-eyebrow {
	margin: 0;
	font-size: 12px;
	font-weight: 800;
	letter-spacing: .12em;
	text-transform: uppercase;
	opacity: .7;
}
.platform-title,
.platform-stage h3 {
	margin: 0;
}
.platform-subtitle,
.platform-stage p {
	margin: 0;
	opacity: .76;
	line-height: 1.55;
}
.platform-facts,
.platform-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}
.platform-fact {
	display: grid;
	gap: 2px;
	min-width: 130px;
	padding: 9px 12px;
	border-radius: 12px;
	background: rgba(127, 127, 160, .09);
}
.platform-fact span {
	font-size: 11px;
	opacity: .64;
}
.platform-action {
	padding: 9px 13px;
	border: 1px solid rgba(127, 127, 180, .28);
	border-radius: 999px;
	background: rgba(127, 127, 160, .08);
	color: inherit;
	cursor: pointer;
}
.platform-action:hover,
.platform-action:focus-visible {
	background: rgba(91, 84, 214, .16);
	outline: none;
}
.platform-journey {
	display: grid;
	gap: 20px;
}
.platform-stage {
	display: grid;
	gap: 10px;
}
.platform-stage-heading {
	display: flex;
	align-items: end;
	justify-content: space-between;
	gap: 12px;
}
.platform-stage-count {
	min-width: 28px;
	padding: 4px 8px;
	border-radius: 999px;
	text-align: center;
	background: rgba(127, 127, 160, .12);
}
.platform-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 12px;
}
`;
