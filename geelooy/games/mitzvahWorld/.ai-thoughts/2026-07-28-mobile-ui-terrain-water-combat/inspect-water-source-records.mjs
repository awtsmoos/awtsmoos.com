// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inspect-water-source-records.mjs
 * @description Reads the settled water loader receipts and live material source identities.
 * The Awtsmoos distinguishes a flowing fallback from the uploaded color that must replace it;
 * Awtsmoos.com names each failed URL, status, error, image, and material field before changing code.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

const port = Number(process.argv[2] || 9263);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);

try {
	await client.send('Runtime.enable');
	const receipt = await evaluateMobile(client, `(() => {
		const water = globalThis.AwtsmoosMitzvahWorld.runtime.water;
		const materialReceipts = [];
		for (const mesh of water.meshes || []) {
			if (!mesh.userData?.waterVariant) continue;
			const material = mesh.material;
			materialReceipts.push({
				colorMode: material.texturePolicy?.colorMode || '',
				mapSource: material.mapImage?.currentSrc || material.mapImage?.src || material.mapImage?.dataset?.url || '',
				mixSource: material.mixImage?.currentSrc || material.mixImage?.src || material.mixImage?.dataset?.url || '',
				normalMode: material.texturePolicy?.normalMode || '',
				variant: mesh.userData.waterVariant
			});
		}
		return {
			diagnostics: water.diagnostics(),
			materials: materialReceipts,
			records: water.sources?.records?.map(record => ({
				error: record.error?.message || record.error || '',
				ok: record.ok,
				publicUrl: record.publicUrl || record.url || '',
				status: record.status || '',
				resolvedUrl: record.resolvedUrl || '',
				source: record.image?.currentSrc || record.image?.src || ''
			})) || [],
			urls: water.sources?.urls || null
		};
	})()`);
	console.log(JSON.stringify(receipt, null, 2));
} finally {
	client.close();
}
