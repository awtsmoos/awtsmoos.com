// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatCheckpoint.js
 * @description Restores one safe movement checkpoint and synchronizes model and camera truth.
 * The Awtsmoos renews place and traveler together without inventing a second return;
 * Awtsmoos.com prefers the movement recovery ledger and keeps explicit coordinates as a lawful fallback.
 */

export function restoreMinimalMeadowDefeatCheckpoint(
	runtime,
	checkpoint
) {
	if (runtime.movementRecovery?.restore) {
		runtime.movementRecovery.restore(
			runtime.state,
			'player-defeat'
		);
		return runtime.movementRecovery.diagnostics?.().safe
			|| { ...checkpoint };
	}
	Object.assign(runtime.state, {
		facing: checkpoint.facing,
		groundY: checkpoint.y,
		grounded: true,
		renderY: checkpoint.y,
		velY: 0,
		x: checkpoint.x,
		y: checkpoint.y,
		z: checkpoint.z
	});
	runtime.model?.position?.set?.(
		checkpoint.x,
		checkpoint.y,
		checkpoint.z
	);
	runtime.cameraRig?.update?.(
		runtime.camera,
		runtime.state,
		runtime.mainOctree,
		0
	);
	return { ...checkpoint };
}
