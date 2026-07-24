//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { pause } from './cdp-client.mjs';

/**
 * @module BrowserModelInspection
 * @description
 * Chrome taps a non-gameplay civic model and proves Awtsmoos.com reveals its
 * purpose, acknowledges it through the camera director, and leaves navigation
 * untouched even when a slow renderer outlives the temporary focus animation.
 */
export async function inspectModelPurpose(client) {
	await client.evaluate(`(() => {
		const canvas = document.querySelector('#cityStage canvas');
		const bounds = canvas.getBoundingClientRect();
		canvas.dispatchEvent(new PointerEvent('pointerdown', {
			bubbles: true,
			clientX: bounds.left + bounds.width / 2,
			clientY: bounds.top + bounds.height / 2
		}));
	})()`);
	await client.waitFor(`!document.querySelector('.modelInspector')?.hidden`);
	await pause(80);
	const result = await client.evaluate(`(() => {
		const canvas = document.querySelector('#cityStage canvas');
		const card = document.querySelector('.modelInspector');
		return {
			kind: 'model-inspection',
			name: card?.querySelector('strong')?.textContent || '',
			role: card?.dataset.role || '',
			reason: card?.dataset.reason || '',
			inspections: Number(canvas?.dataset.inspections || 0),
			cameraMode: canvas?.dataset.cameraMode || '',
			cameraAcknowledged: canvas?.dataset.cameraAcknowledged || '',
			hash: location.hash
		};
	})()`);
	assert.ok(result.name && result.role && result.reason, JSON.stringify(result));
	assert.ok(result.inspections >= 1, JSON.stringify(result));
	assert.equal(result.cameraAcknowledged, 'true');
	assert.ok(['focus', 'home'].includes(result.cameraMode));
	assert.equal(result.hash, '');
	return result;
}
