// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verify-real-water-hydration.mjs
 * @description Fresh-loads large uploaded water images and binds them to the settled live world.
 * The Awtsmoos carries shallow color and seamless movement into vessels already flowing; Awtsmoos.com
 * records exact image sources, normal sources, hydration count, and material roles after the long decode.
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
	await client.send('Network.enable');
	const receipt = await evaluateMobile(client, `(async () => {
		const stamp = Date.now();
		const sourceModule = await import(
			'/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWaterSources.js?water=' + stamp
		);
		const hydrationModule = await import(
			'/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWaterMaterialHydration.js?water=' + stamp
		);
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const sources = await sourceModule.loadMinimalMeadowWaterSources(globalThis);
		const hydratedMeshes = hydrationModule.hydrateMinimalMeadowWaterMaterials(
			runtime.water.meshes,
			sources
		);
		runtime.water.sources = sources;
		runtime.water.hydratedMeshes = hydratedMeshes;
		runtime.water.hydrationState = sources.hostedColorReady === 2
			? 'textured-water-ready'
			: 'procedural-visible';
		const materials = runtime.water.meshes
			.filter(mesh => mesh.userData?.waterVariant)
			.map(mesh => ({
				colorMode: mesh.material.texturePolicy?.colorMode || '',
				mapSource: source(mesh.material.mapImage),
				mixSource: source(mesh.material.mixImage),
				normalDetailSource: source(mesh.material.normalDetailImage),
				normalSource: source(mesh.material.normalImage),
				roles: mesh.material.textureLayers?.map(layer => layer.role) || [],
				variant: mesh.userData.waterVariant
			}));
		return {
			colorMode: sources.colorMode,
			hostedColorReady: sources.hostedColorReady,
			hydratedMeshes,
			materials,
			normalMode: sources.normalMode,
			records: sources.records.map(record => ({
				ok: record.ok,
				publicUrl: record.publicUrl || record.url || '',
				source: source(record.image)
			})),
			timeoutPolicy: sources.timeoutPolicy
		};
		function source(image) {
			return image?.currentSrc || image?.src || image?.dataset?.url || '';
		}
	})()`);
	console.log(JSON.stringify(receipt, null, 2));
	const valid = receipt.hostedColorReady === 2
		&& receipt.colorMode === 'uploaded-shallow-river-color'
		&& receipt.materials.every(material => {
			return /shallow%20river%20water\.png$/i.test(material.mapSource)
				&& /seamless%20water\.png$/i.test(material.mixSource)
				&& material.normalSource
				&& material.normalDetailSource;
		});
	process.exitCode = valid ? 0 : 1;
} finally {
	client.close();
}
