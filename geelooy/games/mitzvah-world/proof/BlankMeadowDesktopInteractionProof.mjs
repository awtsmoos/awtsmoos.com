//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BlankMeadowDesktopInteractionProof.mjs
 * @description Proves lawful Blank Meadow desktop movement, jump, camera, cinematic rail, and Bag interaction through real browser input.
 * The Awtsmoos renews each measured deed while Awtsmoos.com joins motion and visible UI action without waking combat, enemies, or imagined fixtures.
 */

import { enterEnabledBlankMeadow } from './BlankMeadowDesktopEntry.mjs';
import {
	blankMeadowDesktopControlsAccepted,
	measureBlankMeadowDesktopControls
} from './BlankMeadowDesktopMeasurement.mjs';
import { proveBlankMeadowRailInteraction } from './BlankMeadowRailInteractionProof.mjs';
import { createCdpProofSession } from './CdpProofSession.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';
import { waitForPersistentRuntime } from './StatePersistenceRecoveryCdp.mjs';

const port = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9667);
const base = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:5183';
const session = await createCdpProofSession(port);

try {
	const command = session.command;
	await configure(command);
	await command('Page.navigate', {
		url: `${base}/games/mitzvahWorld/index.html?blank-desktop=${Date.now()}`
	});
	const clickAt = await enterEnabledBlankMeadow(command);
	const readiness = await waitForPersistentRuntime(command, 1200);
	const controls = await measureBlankMeadowDesktopControls(command);
	const rail = await proveBlankMeadowRailInteraction(command);
	const result = {
		clickAt,
		controls,
		rail,
		worldExperience: readiness.worldExperience,
		evidence: session.evidence
	};
	const accepted = accepts(result);
	console.log(JSON.stringify({ ...result, accepted }, null, 2));
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

function accepts(result) {
	return result.worldExperience === 'blank-meadow'
		&& blankMeadowDesktopControlsAccepted(result.controls)
		&& result.rail.ready?.marker === 'true'
		&& result.rail.ready?.style === true
		&& result.rail.opened === true
		&& browserEvidenceClean(result.evidence);
}

function browserEvidenceClean(evidence) {
	return evidence.consoleErrors.length === 0
		&& evidence.loadingFailures.length === 0
		&& evidence.networkErrors.length === 0
		&& evidence.runtimeExceptions.length === 0;
}
