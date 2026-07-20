// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ResponsiveGameplayStyles.js
 * @description Installs desktop sheets, mobile bottom sheets, ribbon, vendor, and stat CSS.
 * The Awtsmoos renews one adventure through mouse, keyboard, thumb, and narrow glass;
 * Awtsmoos.com preserves safe areas, readable hierarchy, and forty-eight-pixel controls.
 */

const STYLE_ID = 'Awtsmoos-responsive-gameplay-style';

export function installResponsiveGameplayStyles() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = responsiveCss();
	document.head.appendChild(style);
}

function responsiveCss() {
	return `
		.Awtsmoos-sheet {
			position: fixed;
			top: max(72px, env(safe-area-inset-top));
			right: max(14px, env(safe-area-inset-right));
			bottom: max(86px, env(safe-area-inset-bottom));
			z-index: 905;
			width: min(430px, calc(100vw - 28px));
			overflow: auto;
			padding: 16px;
			border: 1px solid #b58a48;
			border-radius: 18px;
			background: #07100ff2;
			color: #f5eee0;
			box-shadow: 0 22px 70px #000b;
			font: 14px/1.45 system-ui;
			backdrop-filter: blur(12px);
		}
		.Awtsmoos-sheet[hidden] { display: none; }
		.Awtsmoos-sheet-header { display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 2; background: #07100f; }
		.Awtsmoos-sheet-header h2 { margin: 0; color: #ffd784; }
		.Awtsmoos-sheet-header small { color: #9ec8b6; }
		.Awtsmoos-sheet-header button { margin-left: auto; }
		.Awtsmoos-sheet button { min-width: 48px; min-height: 48px; border: 1px solid #b48643; border-radius: 11px; background: #34240f; color: #ffe8b1; font-weight: 800; }
		.Awtsmoos-status-ribbon { position: fixed; top: max(10px, env(safe-area-inset-top)); left: 50%; z-index: 735; display: flex; gap: 10px; align-items: center; max-width: 92vw; overflow: auto; padding: 8px 12px; transform: translateX(-50%); border: 1px solid #8a744c; border-radius: 999px; background: #07100ee8; color: #fff; white-space: nowrap; font: 12px system-ui; backdrop-filter: blur(10px); }
		.Awtsmoos-profile-summary,.Awtsmoos-derived-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
		.Awtsmoos-profile-summary span,.Awtsmoos-derived-grid span { padding: 9px; border-radius: 10px; background: #ffffff0b; text-align: center; }
		.Awtsmoos-stat-grid,.Awtsmoos-powerup-grid,.Awtsmoos-vendor-grid { display: grid; gap: 8px; }
		.Awtsmoos-stat-card,.Awtsmoos-powerup-card,.Awtsmoos-vendor-card { display: grid; grid-template-columns: 38px 1fr auto auto; gap: 9px; align-items: center; padding: 10px; border: 1px solid #30473f; border-radius: 12px; background: #111d19; }
		.Awtsmoos-powerup-card,.Awtsmoos-vendor-card { grid-template-columns: 38px 1fr auto; }
		.Awtsmoos-stat-card span,.Awtsmoos-powerup-card span,.Awtsmoos-vendor-card span { font-size: 25px; }
		.Awtsmoos-stat-card small,.Awtsmoos-powerup-card small,.Awtsmoos-vendor-card small { display: block; color: #b9c9c2; }
		.Awtsmoos-panel-message { min-height: 22px; color: #ffca76; }
		.Awtsmoos-wallet { padding: 10px; border-radius: 10px; background: #3b2a12; color: #ffe2a2; font-weight: 800; }
		.Awtsmoos-action-bar button { min-width: 50px; min-height: 50px; }
		.Awtsmoos-status-dock { transform: scale(.78); transform-origin: top left; opacity: .88; }
		.Awtsmoos-realtime-status { transform: scale(.76); transform-origin: top right; opacity: .84; }
		.Awtsmoos-camera-mode-toggle { transform: scale(.78); transform-origin: bottom right; opacity: .82; }
		.Awtsmoos-minimap { width: 154px; opacity: .82; }
		.Awtsmoos-minimap header { padding: 5px 7px; font-size: 11px; }
		.Awtsmoos-minimap header button { min-height: 28px; padding: 4px 7px; }
		.Awtsmoos-action-host { transform: translateX(-50%) scale(.8); transform-origin: bottom center; opacity: .86; }
		#joy { transform: scale(.72); transform-origin: bottom left; opacity: .52; }
		#jump { transform: scale(.72); transform-origin: bottom right; opacity: .52; }
		@media (max-width: 700px) {
			.Awtsmoos-sheet { top: auto; right: 0; bottom: 0; left: 0; width: auto; max-height: min(78vh, 720px); padding: 14px max(14px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left)); border-radius: 20px 20px 0 0; }
			.Awtsmoos-status-ribbon { top: max(6px, env(safe-area-inset-top)); max-width: 96vw; gap: 7px; padding: 6px 9px; }
			.Awtsmoos-profile-summary,.Awtsmoos-derived-grid { grid-template-columns: repeat(2, 1fr); }
			.Awtsmoos-stat-card { grid-template-columns: 34px 1fr auto auto; }
			.Awtsmoos-quest-tracker { top: 56px; max-height: 32vh; overflow: auto; }
			.Awtsmoos-action-bar { padding-bottom: max(6px, env(safe-area-inset-bottom)); overflow-x: auto; }
		}
	`;
}
