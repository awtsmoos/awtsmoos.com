// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ResponsiveGameplayStyles.js
 * @description Installs readable sheets, profile grids, cards, and mobile-safe panel geometry.
 * The Awtsmoos reveals one adventure through broad and narrow glass; Awtsmoos.com uses direct
 * dimensions instead of scale transforms so letters remain sharp and permanent HUD costs stay low.
 */

const STYLE_ID = 'Awtsmoos-responsive-gameplay-style';

export function installResponsiveGameplayStyles() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = responsiveCss();
	document.head.appendChild(style);
}

function responsiveCss() {
	return `
		.Awtsmoos-sheet {
			position: fixed;
			top: max(64px, env(safe-area-inset-top));
			right: max(10px, env(safe-area-inset-right));
			bottom: max(64px, env(safe-area-inset-bottom));
			z-index: 905;
			width: min(400px, calc(100vw - 20px));
			overflow: auto;
			padding: 13px;
			border: 1px solid #9b7844;
			border-radius: 14px;
			background: rgba(5, 16, 15, .98);
			color: #f5eee0;
			box-shadow: 0 16px 44px rgba(0, 0, 0, .48);
			font: 13px/1.42 system-ui;
		}
		.Awtsmoos-sheet[hidden] {
			display: none;
		}
		.Awtsmoos-sheet-header {
			position: sticky;
			top: 0;
			z-index: 2;
			display: flex;
			align-items: center;
			gap: 9px;
			background: #07100f;
		}
		.Awtsmoos-sheet-header h2 {
			margin: 0;
			color: #ffd784;
		}
		.Awtsmoos-sheet-header small {
			color: #9ec8b6;
		}
		.Awtsmoos-sheet-header button {
			margin-left: auto;
		}
		.Awtsmoos-sheet button {
			min-width: 38px;
			min-height: 38px;
			border: 1px solid #9a7239;
			border-radius: 9px;
			background: #34240f;
			color: #ffe8b1;
			font-weight: 800;
		}
		.Awtsmoos-status-ribbon {
			position: fixed;
			top: max(8px, env(safe-area-inset-top));
			left: 50%;
			z-index: 735;
			display: flex;
			gap: 7px;
			align-items: center;
			max-width: 72vw;
			overflow: auto;
			padding: 6px 10px;
			border: 1px solid #796844;
			border-radius: 999px;
			background: rgba(5, 16, 15, .96);
			color: #fff;
			font: 11px system-ui;
			white-space: nowrap;
			transform: translateX(-50%);
		}
		.Awtsmoos-profile-summary,
		.Awtsmoos-derived-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 7px;
			margin: 10px 0;
		}
		.Awtsmoos-profile-summary span,
		.Awtsmoos-derived-grid span {
			padding: 7px;
			border-radius: 8px;
			background: rgba(255, 255, 255, .045);
			text-align: center;
		}
		.Awtsmoos-stat-grid,
		.Awtsmoos-powerup-grid,
		.Awtsmoos-vendor-grid {
			display: grid;
			gap: 7px;
		}
		.Awtsmoos-stat-card,
		.Awtsmoos-powerup-card,
		.Awtsmoos-vendor-card {
			display: grid;
			grid-template-columns: 32px 1fr auto auto;
			gap: 7px;
			align-items: center;
			padding: 8px;
			border: 1px solid #30473f;
			border-radius: 9px;
			background: #111d19;
		}
		.Awtsmoos-powerup-card,
		.Awtsmoos-vendor-card {
			grid-template-columns: 32px 1fr auto;
		}
		.Awtsmoos-stat-card span,
		.Awtsmoos-powerup-card span,
		.Awtsmoos-vendor-card span {
			font-size: 21px;
		}
		.Awtsmoos-stat-card small,
		.Awtsmoos-powerup-card small,
		.Awtsmoos-vendor-card small {
			display: block;
			color: #b9c9c2;
		}
		.Awtsmoos-panel-message {
			min-height: 20px;
			color: #ffca76;
		}
		.Awtsmoos-wallet {
			padding: 8px;
			border-radius: 8px;
			background: #3b2a12;
			color: #ffe2a2;
			font-weight: 800;
		}
		@media (max-width: 700px) {
			.Awtsmoos-sheet {
				top: auto;
				right: 0;
				bottom: 0;
				left: 0;
				width: auto;
				max-height: min(76vh, 680px);
				padding: 12px max(12px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
				border-radius: 16px 16px 0 0;
			}
			.Awtsmoos-profile-summary,
			.Awtsmoos-derived-grid {
				grid-template-columns: repeat(2, 1fr);
			}
			.Awtsmoos-stat-card {
				grid-template-columns: 30px 1fr auto auto;
			}
		}
	`;
}
