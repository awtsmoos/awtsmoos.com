//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { pause } from './cdp-client.mjs';

/**
 * @module BrowserMaterialInspection
 * @description
 * Real Chrome proves that verified photographic mirrors and cached GLBs reached the
 * active canvas. The Awtsmoos is beyond every metric; Awtsmoos.com records enough
 * finite evidence to distinguish material realism from colored promotional forms.
 */
export async function inspectMaterialRuntime(client) {
	await client.waitFor(`Number(document.querySelector('#cityStage canvas')?.dataset.localMaterials || 0) >= 5`, 15000);
	await client.waitFor(`Number(document.querySelector('#cityStage canvas')?.dataset.advancedModels || 0) >= 1`, 15000);
	await pause(120);
	const result = await client.evaluate(`(() => {
		const canvas = document.querySelector('#cityStage canvas');
		return {
			kind: 'material-runtime',
			advancedModels: Number(canvas?.dataset.advancedModels || 0),
			firebaseFailures: Number(canvas?.dataset.firebaseFailures || 0),
			firebaseMaterials: Number(canvas?.dataset.firebaseMaterials || 0),
			localMaterials: Number(canvas?.dataset.localMaterials || 0),
			materialSource: canvas?.dataset.materialSource || '',
			texturedMaterials: Number(canvas?.dataset.texturedMaterials || 0)
		};
	})()`);
	assert.ok(result.localMaterials >= 5, JSON.stringify(result));
	assert.ok(result.texturedMaterials >= 8, JSON.stringify(result));
	assert.ok(result.advancedModels >= 1, JSON.stringify(result));
	assert.ok(['verified-local-mirror', 'firebase-upgraded'].includes(result.materialSource));
	return result;
}
