//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file StatePersistenceRecoveryProof.mjs
 * @description Proves Blank Meadow state, lawful saves, reload restoration, and recovery in one Chrome profile.
 * The Awtsmoos renews creation without severing truth from truth; Awtsmoos.com crosses the browser seam
 * only when motion, possession, teaching, and recovery return through production vessels without a fabricated dream.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import { enterSinglePlayer } from './MobileGameplayCdp.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';
import {
	preparePersistentRuntimeState,
	waitForPersistentRuntime
} from './StatePersistenceRecoveryCdp.mjs';

const port = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const base = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:5183';
const session = await createCdpProofSession(port);

try {
	const command = session.command;
	await configure(command);
	await enter(command, 'before');
	const prepared = await preparePersistentRuntimeState(command);
	await enter(command, 'after');
	const restored = await waitForPersistentRuntime(command);
	const result = { prepared, restored, evidence: session.evidence };
	const acceptance = accepted(result);
	console.log(JSON.stringify({ ...result, accepted: acceptance }, null, 2));
	if (!acceptance) process.exitCode = 1;
} finally {
	await session.close();
}

async function configure(command) {
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await command(`${domain}.enable`);
	await prepareProofCache(command);
	await command('Page.bringToFront');
}

async function enter(command, label) {
	const url = `${base}/games/mitzvahWorld/index.html?persist=${label}-${Date.now()}`;
	await command('Page.navigate', { url });
	await enterSinglePlayer(command, 'blank-meadow');
}

function accepted({ prepared, restored, evidence }) {
	const { before, mutation, recovery, saved } = prepared;
	const gameplayQuantity = saved.gameplaySave?.inventory?.items?.['purifying-water'];
	const verticalQuest = saved.verticalSliceSave?.quest;
	const verticalRecovery = saved.verticalSliceSave?.recovery;
	const restoredGameplayQuantity = restored.gameplaySave?.inventory?.items?.['purifying-water'];
	const restoredVerticalQuest = restored.verticalSliceSave?.quest;
	const restoredVerticalRecovery = restored.verticalSliceSave?.recovery;
	return before.runtimeFound
		&& before.bootstrapReady
		&& before.worldExperience === 'blank-meadow'
		&& before.inventoryQuantity === 0
		&& before.teachingQuest?.index === 0
		&& recovery.result === true
		&& Number(recovery.facade?.count || 0) >= 1
		&& Number(recovery.movement?.recoveries || 0) >= 1
		&& recovery.movement?.lastReason === 'unstuck-command'
		&& distance(before.position, saved.position) > 0.15
		&& mutation.afterQuantity === mutation.beforeQuantity + 1
		&& mutation.afterQuest?.index === mutation.beforeQuest?.index + 1
		&& gameplayQuantity === mutation.afterQuantity
		&& verticalQuest?.index === mutation.afterQuest?.index
		&& Number(verticalRecovery?.recoveries || 0) >= 1
		&& verticalRecovery?.lastReason === 'unstuck-command'
		&& distance(saved.position, saved.gameplaySave?.position) < 1
		&& restored.runtimeFound
		&& restored.bootstrapReady
		&& restored.worldExperience === 'blank-meadow'
		&& restored.inventoryQuantity === mutation.afterQuantity
		&& restoredGameplayQuantity === mutation.afterQuantity
		&& restored.teachingQuest?.index === mutation.afterQuest?.index
		&& restoredVerticalQuest?.index === mutation.afterQuest?.index
		&& Number(restoredVerticalRecovery?.recoveries || 0) >= 1
		&& distance(saved.gameplaySave?.position, restored.position) < 1
		&& restored.gameplayContinuity?.restored === true
		&& !restored.lastFrameError
		&& browserEvidenceClean(evidence);
}

function browserEvidenceClean(evidence) {
	return evidence.consoleErrors.length === 0
		&& evidence.loadingFailures.length === 0
		&& evidence.networkErrors.length === 0
		&& evidence.runtimeExceptions.length === 0;
}

function distance(first, second) {
	return first && second ? Math.hypot(second.x - first.x, second.z - first.z) : Infinity;
}
