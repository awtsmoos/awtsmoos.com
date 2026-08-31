//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealMobileGameplayProof.mjs
 * @description Rejects any phone build whose joystick is hidden, touch movement is inert, canonical terrain stays bootstrap-only, or real remote texture garments never bind.
 * The Awtsmoos joins thumb, traveler, and textured earth beneath one public covenant of light;
 * Awtsmoos.com calls the valley ready only when the mobile keli can move and the canonical ground is visibly clothed in sight.
 */

import { createCdpProofSession } from './CdpProofSession.mjs';
import {
	configureMobileBrowser,
	dragVisibleJoystick,
	enterSinglePlayer,
	waitForCanonicalTerrain,
	waitForFirstMobileControl
} from './MobileGameplayCdp.mjs';
import { readMobileGameplayState } from './MobileGameplayState.mjs';

const CDP_PORT = Number(process.env.MITZVAH_WORLD_CDP_PORT || 9999);
const BASE_URL = process.env.MITZVAH_WORLD_PROOF_BASE || 'http://127.0.0.1:8910';
const GAME_URL = `${BASE_URL}/games/mitzvahWorld/index.html?mobile-proof=${Date.now()}`;
const session = await createCdpProofSession(CDP_PORT);

try {
	const command = session.command;
	await configureMobileBrowser(command);
	await command('Page.navigate', { url: GAME_URL });
	const clickedAt = await enterSinglePlayer(command);
	const firstControl = await waitForFirstMobileControl(command);
	assertVisibleJoystick(firstControl.joystick);
	const beforeTouch = firstControl.state;
	await dragVisibleJoystick(command, firstControl.joystick.ring);
	const afterTouch = await readMobileGameplayState(command);
	const touchDisplacement = distance(beforeTouch, afterTouch.state);
	const canonical = await waitForCanonicalTerrain(command);
	const readyAt = Math.max(
		firstControl.milestones.firstTerrainVisible,
		firstControl.milestones.playerControllable
	);
	const result = {
		gameUrl: GAME_URL,
		clickToControlMilliseconds: readyAt - clickedAt,
		scriptToTerrainMilliseconds: firstControl.milestones.firstTerrainVisible,
		touchDisplacement,
		joystick: canonical.joystick,
		canonical: canonical.canonical,
		terrain: canonical.terrain,
		viewport: canonical.viewport,
		lastFrameError: canonical.lastFrameError,
		evidence: session.evidence
	};
	console.log(JSON.stringify(result, null, 2));
	assertReleaseReady(result);
} finally {
	await session.close();
}

/** Requires a visible neutral mobile control before any synthetic finger is allowed to touch it. */
function assertVisibleJoystick(joystick) {
	if (!joystick.ready) throw new Error('mobile joystick never reported ready');
	if (joystick.display === 'none' || joystick.visibility === 'hidden' || joystick.opacity < 0.2) {
		throw new Error(`mobile joystick hidden: ${JSON.stringify(joystick)}`);
	}
	if (!(joystick.ring?.width >= 60 && joystick.ring?.height >= 60)) {
		throw new Error(`mobile joystick ring too small: ${JSON.stringify(joystick.ring)}`);
	}
	if (!(joystick.knob?.width >= 20 && joystick.knob?.height >= 20)) {
		throw new Error(`mobile joystick knob too small: ${JSON.stringify(joystick.knob)}`);
	}
}

/** Applies the hard production covenant that replaces earlier fallback-playable smoke acceptance. */
function assertReleaseReady(result) {
	const terrain = result.terrain;
	const evidence = result.evidence;
	if (!(result.scriptToTerrainMilliseconds < 2000)) throw new Error('first terrain exceeded two seconds');
	if (!(result.clickToControlMilliseconds < 2000)) throw new Error('mobile control exceeded two seconds after click');
	if (!(result.touchDisplacement > 0.25)) throw new Error(`touch did not move player: ${result.touchDisplacement}`);
	if (result.canonical.status !== 'ready') throw new Error(`canonical world not ready: ${JSON.stringify(result.canonical)}`);
	if (result.canonical.textureEvidence?.status !== 'ready') throw new Error('canonical terrain texture evidence not ready');
	if (terrain.bootstrap || !terrain.meshFound || !terrain.meshVisible) throw new Error(`canonical terrain not visible: ${JSON.stringify(terrain)}`);
	if (!terrain.realBaseImage || !terrain.realMixImage) throw new Error(`canonical terrain maps are not real: ${JSON.stringify(terrain)}`);
	if (!(terrain.mapImage?.width > 0 && terrain.mapImage?.height > 0)) throw new Error('canonical grass image is not decoded');
	if (!(terrain.mixImage?.width > 0 && terrain.mixImage?.height > 0)) throw new Error('canonical dirt image is not decoded');
	if (result.lastFrameError) throw new Error(`frame error: ${result.lastFrameError}`);
	for (const [kind, rows] of Object.entries(evidence)) {
		if (rows.length) throw new Error(`${kind}: ${JSON.stringify(rows)}`);
	}
}

function distance(before, after) {
	if (!before || !after) return 0;
	return Math.hypot(after.x - before.x, after.z - before.z);
}
