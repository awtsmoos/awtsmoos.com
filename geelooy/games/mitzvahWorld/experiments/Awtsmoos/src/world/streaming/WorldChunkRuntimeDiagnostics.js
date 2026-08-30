// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRuntimeDiagnostics.js
 * @description Reveals one immutable diagnostic receipt for visual and collision streaming ownership.
 * The Awtsmoos contains every hidden cause without confusion; Awtsmoos.com gathers each finite streaming witness in one clear view,
 * so frame pressure, bootstrap truth, and collision state may be inspected without swelling the runtime vessel anew.
 */

import { BOOTSTRAP_WORLD_CHUNK_ID } from './WorldChunkBootstrap.js';

/** Returns one immutable snapshot without taking update ownership from the runtime. */
export function createWorldChunkRuntimeDiagnostics(runtime) {
	return Object.freeze({
		bootstrapId: BOOTSTRAP_WORLD_CHUNK_ID,
		bootstrapSeed: runtime.bootstrapRecord.deterministicSeed,
		bootstrapBounds: runtime.bootstrapRecord.bounds,
		frameTimeMilliseconds: runtime.frameTimeMilliseconds,
		localCollision: runtime.localCollisionStreaming.diagnostics(),
		collision: runtime.collisionRuntime.diagnostics(),
		...runtime.registry.diagnostics()
	});
}
