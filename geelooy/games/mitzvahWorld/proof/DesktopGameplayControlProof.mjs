//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DesktopGameplayControlProof.mjs
 * @description Proves Blank Meadow desktop movement, jump, camera, and interaction through real CDP input.
 * The Awtsmoos renews each measured deed while Awtsmoos.com refuses imagined control; keyboard and mouse
 * must move, turn, leap, orbit, and act through the living production runtime with a clean browser witness.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import {
	facingDistance,
	holdDesktopKey,
	planarDistance,
	proveDesktopCameraDrag,
	proveDesktopJump,
	readDesktopSnapshot,
	vectorDistance
} from './DesktopGameplayControlCdp.mjs';
import { proveDesktopInteraction } from './DesktopGameplayInteractionCdp.mjs';
import { enterSinglePlayer } from './MobileGameplayCdp.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';
import { waitForPersistentRuntime } from './StatePersistenceRecoveryCdp.mjs';

const port = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9667);
const base = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:5183';
const session = await createCdpProofSession(port);

try {
	const command = session.command;
	await configure(command);
	await command('Page.navigate', {
		url: `${base}/games/mitzvahWorld/index.html?desktop=${Date.now()}`
	});
	await enterSinglePlayer(command, 'blank-meadow');
	const readiness = await waitForPersistentRuntime(command);
	const start = await readDesktopSnapshot(command);
	const afterW = await holdDesktopKey(command, 'KeyW', 'w', 650);
	const afterS = await holdDesktopKey(command, 'KeyS', 's', 650);
	const afterA = await holdDesktopKey(command, 'KeyA', 'a', 420);
	const afterD = await holdDesktopKey(command, 'KeyD', 'd', 420);
	const jump = await proveDesktopJump(command);
	const camera = await proveDesktopCameraDrag(command);
	const interaction = await proveDesktopInteraction(command);
	const final = await readDesktopSnapshot(command);
	const result = summarize({ afterA, afterD, afterS, afterW, camera, final, interaction, jump, readiness, start });
	const accepted = accepts(result, session.evidence);
	console.log(JSON.stringify({ ...result, evidence: session.evidence, accepted }, null, 2));
	if (!accepted) process.exitCode = 1;
} finally {
	await session.close();
}

async function configure(command) {
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) {
		await command(`${domain}.enable`);
	}
	await prepareProofCache(command);
	await command('Page.bringToFront');
}

function summarize({ afterA, afterD, afterS, afterW, camera, final, interaction, jump, readiness, start }) {
	return {
		aTurn: facingDistance(afterS.player.facing, afterA.player.facing),
		cameraBaselineDrift: vectorDistance(camera.baselineStart.camera, camera.baselineEnd.camera),
		cameraDragDistance: vectorDistance(camera.baselineEnd.camera, camera.after.camera),
		cameraPlayerDrift: planarDistance(camera.baselineEnd.player, camera.after.player),
		dTurn: facingDistance(afterA.player.facing, afterD.player.facing),
		final,
		interaction: {
			afterHealth: interaction.settled.target?.health ?? null,
			beforeHealth: interaction.before.target?.health ?? null,
			damageObserved: interaction.damageObserved,
			fixtureApplied: interaction.fixtureApplied,
			meleeObserved: interaction.meleeObserved,
			targetAcquired: interaction.targetAcquired,
			targetId: interaction.selected.target?.id || null
		},
		jumpRise: jump.peak.player.y - jump.before.player.y,
		sDistance: planarDistance(afterW.player, afterS.player),
		start,
		wDistance: planarDistance(start.player, afterW.player),
		worldExperience: readiness.worldExperience
	};
}

function accepts(result, evidence) {
	const cameraThreshold = Math.max(0.08, result.cameraBaselineDrift * 2.5);
	return result.worldExperience === 'blank-meadow'
		&& result.wDistance > 0.15
		&& result.sDistance > 0.15
		&& result.aTurn > 0.05
		&& result.dTurn > 0.05
		&& result.jumpRise > 0.2
		&& result.cameraDragDistance > cameraThreshold
		&& result.cameraPlayerDrift < 0.08
		&& result.interaction.targetAcquired
		&& result.interaction.fixtureApplied
		&& (result.interaction.meleeObserved || result.interaction.damageObserved)
		&& !result.final.runtimeError
		&& browserEvidenceClean(evidence);
}

function browserEvidenceClean(evidence) {
	return evidence.consoleErrors.length === 0
		&& evidence.loadingFailures.length === 0
		&& evidence.networkErrors.length === 0
		&& evidence.runtimeExceptions.length === 0;
}
