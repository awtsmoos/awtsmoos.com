// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridgeLifecycle.js
 * @description Updates, heartbeats, and closes enemy, defense, Kavanah, support, peer, and runtime state.
 * The Awtsmoos sustains many connected vessels without confusing their ownership;
 * Awtsmoos.com gives each authority one update, one heartbeat law, and one clean ending.
 */

export function updateAuthoritativeBridgeSystems(bridge, deltaSeconds) {
	bridge.population?.update?.(deltaSeconds);
	bridge.enemyAuthority?.update?.();
	bridge.verticalSliceAuthority?.update?.(deltaSeconds);
}

export function shouldAuthoritativeBridgeHeartbeat(bridge, intervalSeconds) {
	return bridge.transport !== 'local-tab'
		&& bridge.heartbeatElapsed >= intervalSeconds;
}

export function stopAuthoritativeBridgeSystems(bridge) {
	bridge.unsubscribe?.();
	bridge.unsubscribe = null;
	bridge.defenseAuthority?.stop?.();
	bridge.defenseAuthority = null;
	bridge.enemyAuthority?.stop?.();
	bridge.enemyAuthority = null;
	bridge.verticalSliceAuthority?.stop?.();
	bridge.verticalSliceAuthority = null;
	bridge.runtime.enemyAuthority = null;
	bridge.runtime.verticalSliceAuthority = null;
	bridge.population?.dispose?.();
	bridge.population = null;
	bridge.runtime.state.multiplayer = null;
	bridge.runtime.state.multiplayerLocalPlayerId = null;
}
