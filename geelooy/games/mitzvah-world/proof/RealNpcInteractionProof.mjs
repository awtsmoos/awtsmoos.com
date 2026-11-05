//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RealNpcInteractionProof.mjs
 * @description Proves a physical canvas click reaches the actual Blank Meadow tailor through the authoritative runtime.
 * The Awtsmoos renews eye, ray, actor, bus, and garment in one causal stream;
 * Awtsmoos.com follows the living runtime, then lets the real merchant answer the dream.
 */

import { fileURLToPath } from 'node:url';
import { startBrowserProof } from '../experiments/Awtsmoos/src/test/browser/BrowserProofProcess.mjs';
import { createCdpProofSession } from './CdpProofSession.mjs';
import { enterSinglePlayer, delay } from './MobileGameplayCdp.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';
import {
	acceptsRealNpcReceipt,
	dispatchCanvasClick,
	dispatchKey,
	evaluateBrowser
} from './RealNpcInteractionProofSupport.mjs';
import { interactionStateExpression } from './RealNpcRuntimeAuthorityExpressions.mjs';
import { tailorProjectionExpression } from './RealNpcTailorProjectionExpression.mjs';
import { waitForPersistentRuntime } from './StatePersistenceRecoveryCdp.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const owner = await startBrowserProof(repositoryRoot);
let proof = null;
let failure = null;

try {
	proof = await createCdpProofSession(owner.cdpPort);
	const { command } = proof;
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) {
		await command(`${domain}.enable`);
	}
	await prepareProofCache(command);
	await command('Emulation.setFocusEmulationEnabled', { enabled: true });
	await command('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 720,
		mobile: false,
		width: 1280
	});
	await command('Page.navigate', {
		url: `${owner.baseUrl}/geelooy/games/mitzvahWorld/index.html?realNpcProof=${Date.now()}`
	});
	await command('Page.bringToFront');
	await enterSinglePlayer(command, 'blank-meadow');
	await waitForPersistentRuntime(command);
	const readiness = await waitForTailor(command);
	const aiming = await aimAtTailor(command);
	if (!aiming.visible) {
		throw new Error(`TAILOR_NOT_VISIBLE ${JSON.stringify(aiming)}`);
	}
	await dispatchCanvasClick(command, aiming.x, aiming.y);
	await delay(180);
	const state = await interactionState(command);
	const receipt = { aiming, evidence: proof.evidence, readiness, state };
	receipt.accepted = acceptsRealNpcReceipt(receipt);
	console.log(`REAL_NPC_INTERACTION_RECEIPT ${JSON.stringify(receipt)}`);
	if (!receipt.accepted) {
		throw new Error(`REAL_NPC_INTERACTION_REJECTED ${JSON.stringify(receipt)}`);
	}
} catch (error) {
	failure = error;
	console.error(error?.stack || error);
} finally {
	try {
		await proof?.close();
	} catch {
	}
	try {
		await owner.stop();
	} catch {
	}
}

if (failure) {
	process.exitCode = 1;
}

async function waitForTailor(command) {
	for (let attempt = 0; attempt < 2880; attempt += 1) {
		const state = await interactionState(command);
		if (state.richReady && state.tailorReady) {
			return state;
		}
		await delay(25);
	}
	const state = await interactionState(command);
	throw new Error(`REAL_TAILOR_NOT_READY ${JSON.stringify(state)}`);
}

async function aimAtTailor(command) {
	for (let step = 0; step < 28; step += 1) {
		const point = await evaluateBrowser(command, tailorProjectionExpression());
		if (point?.visible) {
			return point;
		}
		await dispatchKey(command, 'keyDown', 'd', 'KeyD');
		await delay(120);
		await dispatchKey(command, 'keyUp', 'd', 'KeyD');
		await delay(60);
	}
	return evaluateBrowser(command, tailorProjectionExpression());
}

async function interactionState(command) {
	return evaluateBrowser(command, interactionStateExpression());
}
