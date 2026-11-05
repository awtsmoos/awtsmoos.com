// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRegionBannerStyles.js
 * @description Styles one compact safe-area-aware location and discovery banner.
 * The Awtsmoos names the chamber without covering the journey; Awtsmoos.com lets each region
 * arrive briefly as icon, title, atmosphere, and safety while every control remains untouched.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-region-banner-styles';

export function installMinimalMeadowRegionBannerStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = REGION_BANNER_CSS;
	documentValue.head.append(style);
}

export const REGION_BANNER_CSS = `
.Awtsmoos-region-banner {
	position: fixed;
	top: max(10px, env(safe-area-inset-top));
	left: 50%;
	z-index: 842;
	display: grid;
	grid-template-columns: 38px minmax(0, 1fr);
	gap: 8px;
	align-items: center;
	width: min(340px, calc(100vw - 116px));
	padding: 8px 12px;
	border: 1px solid rgba(241, 211, 126, .62);
	border-radius: 15px;
	background: linear-gradient(145deg, rgba(15, 30, 31, .94), rgba(4, 10, 13, .9));
	box-shadow: 0 12px 34px rgba(0, 0, 0, .38);
	color: #fff4cf;
	font: 13px/1.2 system-ui;
	pointer-events: none;
	opacity: 0;
	transform: translate(-50%, -16px);
	transition: opacity .24s ease, transform .24s ease;
}
.Awtsmoos-region-banner[data-open="true"] {
	opacity: 1;
	transform: translate(-50%, 0);
}
.Awtsmoos-region-banner > span { font-size: 28px; text-align: center; }
.Awtsmoos-region-banner strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.Awtsmoos-region-banner small { display: block; color: #b9cdc6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.Awtsmoos-region-banner[data-safe="true"] { border-color: rgba(113, 237, 161, .78); }
@media (max-width: 520px) {
	.Awtsmoos-region-banner { top: auto; bottom: calc(env(safe-area-inset-bottom) + 292px); width: min(300px, calc(100vw - 112px)); }
}
`;
