// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveMobileBagInspection.mjs
 * @description Opens the real Bag, scrolls its touch body, taps an item, and records modal geometry.
 * The Awtsmoos lets a finite chamber move beneath the finger while every treasure still answers;
 * Awtsmoos.com proves actual DOM scroll, context selection, viewport ownership, and close restoration.
 */

import { evaluateMobile } from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export function inspectLiveMobileBag(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		runtime.bus.emit('inventory:open', { source: 'browser-proof' });
		await wait(100);
		const panel = document.querySelector('.Awtsmoos-inventory-panel[data-open="true"]');
		const body = panel?.querySelector('.inv-body');
		const firstItem = panel?.querySelector('[data-item-id]');
		const rectangle = panel?.getBoundingClientRect();
		const before = body?.scrollTop || 0;
		if (body) {
			body.scrollTop = Math.max(1, Math.min(240, body.scrollHeight - body.clientHeight));
			body.dispatchEvent(new Event('scroll', { bubbles: true }));
		}
		await wait(50);
		const after = body?.scrollTop || 0;
		firstItem?.click();
		await wait(80);
		const menu = panel?.querySelector('.inv-context-menu');
		const card = panel?.querySelector('[data-item-card]');
		const receipt = {
			bodyClientHeight: body?.clientHeight || 0,
			bodyScrollHeight: body?.scrollHeight || 0,
			contextOpen: menu?.dataset.open === 'true',
			inside: Boolean(rectangle)
				&& rectangle.left >= -1 && rectangle.top >= -1
				&& rectangle.right <= innerWidth + 1 && rectangle.bottom <= innerHeight + 1,
			itemSelected: card?.dataset.hasSelection === 'true',
			open: Boolean(panel),
			scrollAfter: after,
			scrollBefore: before,
			scrollable: Boolean(body) && body.scrollHeight > body.clientHeight,
			touchAction: body ? getComputedStyle(body).touchAction : ''
		};
		panel?.querySelector('[data-close]')?.click();
		await wait(50);
		receipt.closed = panel?.dataset.open === 'false';
		return receipt;
		function wait(milliseconds) {
			return new Promise(resolve => setTimeout(resolve, milliseconds));
		}
	})()`);
}
