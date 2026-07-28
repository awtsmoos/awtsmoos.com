// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobile-repair-current-state.mjs
 * @description Attaches without reload and records the loaded mobile world's actual current state.
 * The Awtsmoos reveals what exists beyond a readiness label; Awtsmoos.com reads the living runtime,
 * then exercises targeting, masonry, textures, and HUD only when their vessels are truly present.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	inspectMobileHouseRecovery,
	inspectMobileTargeting
} from './MobileRepairTargetHouseInspection.mjs';
import {
	inspectMobileUiAndMaterials
} from './MobileRepairUiMaterialInspection.mjs';

const port = Number(process.argv[2] || 9258);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await new Promise(resolve => setTimeout(resolve, 1200));
	receipt.state = await evaluateMobile(client, `(() => {
		const root = document.documentElement.dataset;
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		return {
			enemies: runtime?.enemies?.actors?.length || 0,
			featurePhase: runtime?.featureStatus?.phase || '',
			houses: runtime?.houses?.houses?.length || 0,
			readiness: root.awtsmoosReadiness || '',
			remoteResources: performance.getEntriesByType('resource')
				.filter(entry => entry.name.includes('/sites/firebase_drive_migration/')).length,
			rendererStage: root.awtsmoosRendererStage || '',
			richWorldMountStatus: runtime?.richWorldMountStatus || null,
			runtimePresent: Boolean(runtime),
			targetingPresent: Boolean(runtime?.targeting)
		};
	})()`);
	if (receipt.state.runtimePresent
		&& receipt.state.enemies > 0
		&& receipt.state.houses > 0
		&& receipt.state.targetingPresent) {
		receipt.targeting = await inspectMobileTargeting(client);
		receipt.houseSurfaces = await inspectMobileHouseRecovery(client);
		await new Promise(resolve => setTimeout(resolve, 300));
		receipt.presentation = await inspectMobileUiAndMaterials(client);
	}
	receipt.browserEvidence = client.evidence;
	receipt.ok = true;
} catch (error) {
	receipt.error = {
		message: error?.message || String(error),
		stack: error?.stack || ''
	};
	process.exitCode = 1;
} finally {
	client.close();
	console.log(JSON.stringify(receipt, null, 2));
}
