// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WowControlsBrowserUi.mjs
 * @description Measures safe desktop HUD geometry and one-second DOM refresh cadence.
 * The Awtsmoos gives every visible vessel a boundary and appointed renewal; Awtsmoos.com proves
 * panels remain inside the viewport while HUD writes stay far below the animation-frame rate.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function inspectWowUiAndCadence(client) {
	const before = await cadenceSnapshot(client);
	await delay(1000);
	const after = await cadenceSnapshot(client);
	const ui = await evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		runtime.bus.emit('menu:toggle', { source: 'probe' });
		const selectors = [
			'.Awtsmoos-status-dock',
			'.Awtsmoos-target-frame',
			'.Awtsmoos-quest-tracker',
			'.Awtsmoos-game-rail-host',
			'.Awtsmoos-action-host',
			'.Awtsmoos-combat-host'
		];
		const visible = selectors
			.flatMap((selector) => [...document.querySelectorAll(selector)])
			.filter((node) => {
				const rect = node.getBoundingClientRect();
				return rect.width > 0 && rect.height > 0;
			})
			.map(rectangleReceipt);
		const menu = document.querySelector('.Awtsmoos-meadow-menu > section');
		const menuReceipt = menu ? rectangleReceipt(menu) : { inside: false };
		runtime.bus.emit('menu:toggle', { source: 'probe' });
		return {
			menuInside: menuReceipt.inside,
			repair: document.documentElement.dataset.awtsmoosHudRepair || '',
			visible
		};
		function rectangleReceipt(node) {
			const rect = node.getBoundingClientRect();
			return {
				className: node.className,
				inside: rect.left >= -2
					&& rect.top >= -2
					&& rect.right <= innerWidth + 2
					&& rect.bottom <= innerHeight + 2
			};
		}
	})()`);
	return {
		...ui,
		cadence: {
			bootstrapDelta: after.bootstrapRefreshes - before.bootstrapRefreshes,
			uiDelta: after.uiRefreshes - before.uiRefreshes
		}
	};
}

function cadenceSnapshot(client) {
	return evaluateMobile(
		client,
		'globalThis.AwtsmoosMitzvahWorld.runtime.frameCadence.diagnostics()'
	);
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
