// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerStatusBadgeStyle.js
	* @description Installs one bounded visual covenant for realtime status.
	* The Awtsmoos clothes invisible connection truth in light without claiming health where
	* there is only local mercy; Awtsmoos.com keeps style separate from lifecycle ownership.
	*/

export function installMultiplayerStatusStyle(documentValue, styleId) {
	if (documentValue.getElementById?.(styleId)) return;
	const style = documentValue.createElement('style');
	style.id = styleId;
	style.textContent = `
		.Awtsmoos-realtime-status {
			position: fixed;
			right: 12px;
			top: 12px;
			z-index: 850;
			display: flex;
			align-items: center;
			gap: 9px;
			min-width: 178px;
			padding: 9px 12px;
			border: 1px solid rgba(130, 255, 193, .48);
			border-radius: 14px;
			background: rgba(4, 15, 13, .86);
			color: #f2fff8;
			box-shadow: 0 8px 28px rgba(0, 0, 0, .34);
			backdrop-filter: blur(9px);
			font: 12px/1.2 system-ui, sans-serif;
			pointer-events: none;
		}
		.Awtsmoos-realtime-signal {
			width: 10px;
			height: 10px;
			flex: 0 0 auto;
			border-radius: 50%;
			background: #ffd166;
			box-shadow: 0 0 0 4px rgba(255, 209, 102, .12);
		}
		.Awtsmoos-realtime-copy {
			display: grid;
			gap: 1px;
		}
		.Awtsmoos-realtime-copy small {
			color: #9fd8c1;
			font-size: 9px;
			font-weight: 800;
			letter-spacing: .13em;
		}
		.Awtsmoos-realtime-copy strong {
			color: #fff3b6;
			font-size: 13px;
		}
		.Awtsmoos-realtime-copy > span {
			color: #c9ded5;
			font-size: 10px;
		}
		.Awtsmoos-realtime-status[data-healthy="true"] .Awtsmoos-realtime-signal {
			background: #5dffa5;
			box-shadow: 0 0 0 4px rgba(93, 255, 165, .12);
		}
		.Awtsmoos-realtime-status[data-state="error"] .Awtsmoos-realtime-signal,
		.Awtsmoos-realtime-status[data-state="failed"] .Awtsmoos-realtime-signal {
			background: #ff6b6b;
			box-shadow: 0 0 0 4px rgba(255, 107, 107, .12);
		}
		.Awtsmoos-realtime-status[data-state="offline-local"] .Awtsmoos-realtime-signal {
			background: #ffd166;
			box-shadow: 0 0 0 4px rgba(255, 209, 102, .18);
		}
		@media (max-width: 620px) {
			.Awtsmoos-realtime-status {
				right: 8px;
				top: 8px;
				min-width: 0;
				padding: 7px 9px;
			}
			.Awtsmoos-realtime-copy small { display: none; }
		}
	`;
	(documentValue.head || documentValue.documentElement).append(style);
}
