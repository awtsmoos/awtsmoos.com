//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CompoundMobileInputProof.mjs
 * @description Proves simultaneous movement, camera look, jump, cancellation, and recovery at one requested phone viewport.
 * The Awtsmoos joins many fingers without confusion; Awtsmoos.com requires the traveler to move, the horizon to turn,
 * the body to rise, and every cancelled touch to release before a fresh gesture may begin again.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import { enterSinglePlayer, waitForFirstMobileControl } from './MobileGameplayCdp.mjs';
import { runCompoundMobileGesture } from './CompoundMobileInputCdp.mjs';
import { prepareProofCache } from './ProofCachePolicy.mjs';

const port = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9666);
const width = Number(process.env.MITZVAH_WORLD_MOBILE_WIDTH || 390);
const height = Number(process.env.MITZVAH_WORLD_MOBILE_HEIGHT || 844);
const scale = Number(process.env.MITZVAH_WORLD_MOBILE_SCALE || 3);
const base = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:5183';
const session = await createCdpProofSession(port);

try {
	const command = session.command;
	await configure(command);
	await command('Page.navigate', { url: `${base}/games/mitzvahWorld/index.html?compound=${width}x${height}-${Date.now()}` });
	await enterSinglePlayer(command, 'blank-meadow');
	await waitForFirstMobileControl(command);
	const gesture = await runCompoundMobileGesture(command);
	const result = { viewport: { width, height, scale }, gesture, evidence: session.evidence };
	console.log(JSON.stringify(result, null, 2));
	if (!accepted(result)) process.exitCode = 1;
} finally {
	await session.close();
}

async function configure(command) {
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await command(`${domain}.enable`);
	await command('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: scale,
		height,
		mobile: true,
		screenHeight: height,
		screenWidth: width,
		width
	});
	await command('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
	await command('Network.setUserAgentOverride', {
		userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36'
	});
	await prepareProofCache(command);
	await command('Page.bringToFront');
}

function accepted(result) {
	const { gesture, evidence, viewport } = result;
	return gesture.before.runtimeFound
		&& gesture.before.viewport.width === viewport.width
		&& gesture.before.viewport.height === viewport.height
		&& gesture.movement > 0.15
		&& gesture.yawDelta > 0.10
		&& gesture.jumpRise > 0.05
		&& gesture.cancelled.joystickActive === false
		&& gesture.recovery.movement > 0.15
		&& !gesture.combined.lastFrameError
		&& !gesture.cancelled.lastFrameError
		&& evidence.consoleErrors.length === 0
		&& evidence.loadingFailures.length === 0
		&& evidence.networkErrors.length === 0
		&& evidence.runtimeExceptions.length === 0;
}
