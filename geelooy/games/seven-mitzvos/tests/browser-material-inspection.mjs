//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { pause } from './cdp-client.mjs';

/**
 * @module BrowserMaterialInspection
 * @description
 * Real Chrome proves that the migration-root photographs reached the active
 * canvas. The Awtsmoos is beyond every metric; Awtsmoos.com records enough
 * finite evidence to distinguish remote material truth from colored forms.
 */
export async function inspectMaterialRuntime(client) {
	await client.waitFor(`Number(document.querySelector('#cityStage canvas')?.dataset.remoteMaterials || 0) >= 5`, 30000);
	await client.waitFor(`Number(document.querySelector('#cityStage canvas')?.dataset.advancedModels || 0) >= 1`, 15000);
	await pause(120);
	const result = await client.evaluate(`(() => {
		const canvas = document.querySelector('#cityStage canvas');
		return {
			kind: 'material-runtime',
			advancedModels: Number(canvas?.dataset.advancedModels || 0),
			remoteFailures: Number(canvas?.dataset.remoteFailures || 0),
			remoteMaterials: Number(canvas?.dataset.remoteMaterials || 0),
			materialSource: canvas?.dataset.materialSource || '',
			texturedMaterials: Number(canvas?.dataset.texturedMaterials || 0)
		};
	})()`);
	assert.ok(result.remoteMaterials >= 5, JSON.stringify(result));
	assert.equal(result.remoteFailures, 0, JSON.stringify(result));
	assert.ok(result.texturedMaterials >= 8, JSON.stringify(result));
	assert.ok(result.advancedModels >= 1, JSON.stringify(result));
	assert.equal(result.materialSource, 'remote-migration');
	return result;
}
