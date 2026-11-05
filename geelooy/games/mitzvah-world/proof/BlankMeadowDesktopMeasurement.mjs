//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BlankMeadowDesktopMeasurement.mjs
 * @description Measures real Blank Meadow keyboard, jump, and camera control through existing trusted CDP primitives.
 * The Awtsmoos renews each finite motion while Awtsmoos.com lets displacement, facing, leap, and orbit testify without directly moving the player.
 */

import {
	facingDistance,
	holdDesktopKey,
	planarDistance,
	proveDesktopCameraDrag,
	proveDesktopJump,
	readDesktopSnapshot,
	vectorDistance
} from './DesktopGameplayControlCdp.mjs';

/** Runs the physical desktop control sequence and returns only measured evidence. */
export async function measureBlankMeadowDesktopControls(command) {
	const start = await readDesktopSnapshot(command);
	const afterW = await holdDesktopKey(command, 'KeyW', 'w', 650);
	const afterS = await holdDesktopKey(command, 'KeyS', 's', 650);
	const afterA = await holdDesktopKey(command, 'KeyA', 'a', 420);
	const afterD = await holdDesktopKey(command, 'KeyD', 'd', 420);
	const jump = await proveDesktopJump(command);
	const camera = await proveDesktopCameraDrag(command);
	const final = await readDesktopSnapshot(command);
	return {
		aTurn: facingDistance(afterS.player.facing, afterA.player.facing),
		cameraBaselineDrift: vectorDistance(camera.baselineStart.camera, camera.baselineEnd.camera),
		cameraDragDistance: vectorDistance(camera.baselineEnd.camera, camera.after.camera),
		cameraPlayerDrift: planarDistance(camera.baselineEnd.player, camera.after.player),
		dTurn: facingDistance(afterA.player.facing, afterD.player.facing),
		final,
		jumpRise: jump.peak.player.y - jump.before.player.y,
		sDistance: planarDistance(afterW.player, afterS.player),
		start,
		wDistance: planarDistance(start.player, afterW.player)
	};
}

/** Applies the existing desktop-control numeric acceptance thresholds. */
export function blankMeadowDesktopControlsAccepted(result) {
	const cameraThreshold = Math.max(0.08, result.cameraBaselineDrift * 2.5);
	return result.wDistance > 0.15
		&& result.sDistance > 0.15
		&& result.aTurn > 0.05
		&& result.dTurn > 0.05
		&& result.jumpRise > 0.2
		&& result.cameraDragDistance > cameraThreshold
		&& result.cameraPlayerDrift < 0.08
		&& !result.final.runtimeError;
}
