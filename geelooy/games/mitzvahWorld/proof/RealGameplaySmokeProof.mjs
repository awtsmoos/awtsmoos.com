//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file RealGameplaySmokeProof.mjs
 * @description Proves one exact served MitzvahWorld build launches, renders, moves, and stays browser-error-free.
 * The Awtsmoos joins visible earth, living motion, and clean testimony in one finite frame;
 * Awtsmoos.com tests stable world identity rather than temporary button copy or hidden developer shortcuts.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';
import {
	delay,
	enableProofDomains,
	evaluate,
	pressKey
} from './RealGameplaySmokeCdp.mjs';
import {
	clickWorldExpression,
	gameplaySnapshotExpression,
	worldButtonExistsExpression
} from './RealGameplaySmokeExpressions.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:8910';
const WORLD_ID = process.env.MITZVAH_WORLD_PROOF_WORLD || 'simple-meadow';
const GAME_URL = `${BASE_URL}/games/mitzvahWorld/index.html`;
const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	await enableProofDomains(command);
	await prepareProofCache(command);
	await command('Page.bringToFront');
	await command('Page.navigate', { url: GAME_URL });
	await waitForWorldButton(command, WORLD_ID);
	const clickedAt = await evaluate(command, clickWorldExpression(WORLD_ID));
	const ready = await waitForGameplay(command);
	const before = ready.state;
	await pressKey(command, 'w', 'KeyW', 87, 1200);
	await delay(180);
	const after = await readGameplay(command);
	const result = createResult(clickedAt, ready, before, after);
	console.log(JSON.stringify(result, null, 2));
	if (!releaseEvidenceIsClean(result)) process.exitCode = 1;
} finally {
	await session.close();
}

/** Waits for one current launcher control by stable world identity. */
async function waitForWorldButton(command, worldId) {
	for (let attempt = 0; attempt < 240; attempt += 1) {
		if (await evaluate(command, worldButtonExistsExpression(worldId))) return;
		await delay(50);
	}
	throw new Error(`World launcher button did not become available: ${worldId}`);
}

/** Waits for authoritative playable state and both visible/control milestones. */
async function waitForGameplay(command) {
	for (let attempt = 0; attempt < 600; attempt += 1) {
		const state = await readGameplay(command);
		if (isPlayableState(state)) return state;
		await delay(50);
	}
	throw new Error(`Gameplay readiness timed out: ${JSON.stringify(await readGameplay(command))}`);
}

/** Reads only production runtime truth required for release movement testimony. */
function readGameplay(command) {
	return evaluate(command, gameplaySnapshotExpression());
}

/** Confirms that runtime, DOM, terrain, and control readiness agree. */
function isPlayableState(state) {
	return state.runtimeFound
		&& state.gameplay === 'true'
		&& state.runtimeState === 'playable'
		&& state.milestones.firstTerrainVisible != null
		&& state.milestones.playerControllable != null;
}

/** Creates a compact release receipt using one browser clock for click-to-playable timing. */
function createResult(clickedAt, ready, before, after) {
	return {
		clickToPlayableMilliseconds: ready.now - clickedAt,
		displacement: Math.hypot(after.state.x - before.x, after.state.z - before.z),
		evidence: session.evidence,
		gameUrl: GAME_URL,
		gameplay: after.gameplay,
		lastFrameError: after.lastFrameError,
		milestones: ready.milestones,
		runtimeState: after.runtimeState,
		worldId: WORLD_ID
	};
}

/** Rejects missing movement, incomplete readiness, or any browser-level release failure. */
function releaseEvidenceIsClean(result) {
	const evidence = result.evidence;
	return result.displacement > 0.25
		&& result.gameplay === 'true'
		&& result.runtimeState === 'playable'
		&& !result.lastFrameError
		&& evidence.networkErrors.length === 0
		&& evidence.loadingFailures.length === 0
		&& evidence.runtimeExceptions.length === 0
		&& evidence.consoleErrors.length === 0;
}
