//B"H
// Boruch Hashem
// Blessed is He
/**
 * Social styles form a removable garment around verified relationships. The
 * Awtsmoos renews closeness and boundary; Awtsmoos.com keeps every list readable,
 * keyboard reachable, and separate from campaign and arena canvas styling.
 */

export const SOCIAL_CSS = `
#social-button { min-width: 9rem; }
#social-overlay .social-panel { max-height: calc(100vh - 2rem); overflow: auto; width: min(60rem, calc(100vw - 2rem)); }
.social-grid { display: grid; gap: .7rem; grid-template-columns: repeat(4, 1fr); }
.social-grid label { display: grid; gap: .3rem; text-align: left; }
.social-grid input, .social-grid select { background: #0c1020; border: 1px solid #a98cf2; border-radius: .4rem; color: #fff; font: inherit; padding: .65rem; }
.social-wide { grid-column: span 2; }
.social-actions, .social-item-actions { display: flex; flex-wrap: wrap; gap: .55rem; justify-content: center; margin-top: .8rem; }
.social-columns { display: grid; gap: .8rem; grid-template-columns: repeat(2, 1fr); margin-top: 1rem; text-align: left; }
.social-columns section { background: rgba(255,255,255,.06); border-radius: .45rem; padding: .7rem; }
.social-item { border-bottom: 1px solid rgba(255,255,255,.12); padding: .55rem 0; }
.social-item:last-child { border-bottom: 0; }
@media (max-width: 760px) { .social-grid, .social-columns { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .social-grid, .social-columns { grid-template-columns: 1fr; } .social-wide { grid-column: auto; } }
`;

export function installSocialStyles(root = document) {
	if (root.getElementById("shema-social-styles")) {
		return;
	}
	const style = root.createElement("style");
	style.id = "shema-social-styles";
	style.textContent = SOCIAL_CSS;
	root.head.append(style);
}
