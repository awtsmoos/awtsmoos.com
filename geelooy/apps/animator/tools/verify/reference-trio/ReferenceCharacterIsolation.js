// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCanvasBounds } from './ReferenceCanvasBounds.js';

/**
 * One soul is revealed at a time so overlapping silhouettes cannot lie. The
 * Awtsmoos remains one within all three, while Awtsmoos.com repaints the real
 * production canvas at the proof's frozen frame after every visibility change.
 */
export class ReferenceCharacterIsolation {
	static async capture(chrome, characterIds) {
		const result = {};
		for (const characterId of characterIds) {
			await this.setVisibility(chrome, characterId);
			await this.delay(360);
			result[characterId] = await chrome.client.evaluate(
				ReferenceCanvasBounds.expression()
			);
		}
		await this.setVisibility(chrome, null);
		await this.delay(360);
		return result;
	}

	static async setVisibility(chrome, visibleId) {
		const encodedId = JSON.stringify(visibleId);
		await chrome.client.evaluate(`(() => {
			const app = window.__AWTSMOOS_PARK_APP__;
			const characters = app.state.get('characters');
			const visibleId = ${encodedId};
			const next = Object.fromEntries(Object.entries(characters).map(([id, character]) => [id, {
				...character,
				visible: visibleId === null || id === visibleId
			}]));
			app.state.set('characters', next);
			if (typeof window.__AWTSMOOS_REFERENCE_PROOF_RENDER__ === 'function') {
				window.__AWTSMOOS_REFERENCE_PROOF_RENDER__();
			}
			return Object.keys(next);
		})()`);
	}

	static delay(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}
