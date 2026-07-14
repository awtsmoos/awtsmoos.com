//B"H
// Boruch Hashem
// Blessed is He
/**
 * A removable style vessel reveals the online civilization without rewriting
 * campaign CSS. The Awtsmoos renews form and content; Awtsmoos.com keeps public
 * discovery readable, keyboard reachable, and responsive beside solitary play.
 */

export const MULTIPLAYER_CSS = `
#online-button { min-width: 10rem; }
#online-overlay .online-panel { max-height: calc(100vh - 2rem); overflow: auto; width: min(54rem, calc(100vw - 2rem)); }
.online-grid { display: grid; gap: .75rem; grid-template-columns: repeat(3, 1fr); }
.online-grid label { display: grid; gap: .35rem; text-align: left; }
.online-grid input, .online-grid select { background: #0c1020; border: 1px solid #6bc6e8; border-radius: .4rem; color: #fff; font: inherit; padding: .65rem; }
.online-check { align-content: center; grid-template-columns: auto 1fr !important; }
#online-accessibility { display: flex; flex-wrap: wrap; gap: .7rem; margin: 1rem 0; text-align: left; }
#online-accessibility label { display: flex; gap: .35rem; }
.online-actions, .arena-card-actions { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center; margin-top: 1rem; }
#online-status { min-height: 1.5rem; }
#online-players { display: grid; gap: .3rem; list-style: none; margin: 1rem 0; padding: 0; }
#online-players li, .arena-card { background: rgba(255,255,255,.07); border-radius: .35rem; padding: .65rem; }
.online-code { font-size: 1.4rem; letter-spacing: .18em; }
.arena-discovery { display: grid; gap: .65rem; margin-top: 1rem; text-align: left; }
.arena-card h3, .arena-card p { margin: .2rem 0; }
@media (max-width: 760px) { .online-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .online-grid { grid-template-columns: 1fr; } }
`;

export function installMultiplayerStyles(root = document) {
	if (root.getElementById("shema-multiplayer-styles")) {
		return;
	}
	const style = root.createElement("style");
	style.id = "shema-multiplayer-styles";
	style.textContent = MULTIPLAYER_CSS;
	root.head.append(style);
}
