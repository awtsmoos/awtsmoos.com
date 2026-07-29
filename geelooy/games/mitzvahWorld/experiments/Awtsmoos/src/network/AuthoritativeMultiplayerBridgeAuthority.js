// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridgeAuthority.js
 * @description Installs deployed enemy and defense authority into one connected bridge.
 * The Awtsmoos joins separate powers without confusing their vessels; Awtsmoos.com
 * keeps hostile consequence and player protection modular beneath one session covenant.
 */

import { MultiplayerDefenseAuthority } from './MultiplayerDefenseAuthority.js';
import { MultiplayerEnemyAuthorityBridge } from './MultiplayerEnemyAuthorityBridge.js';

export function installMultiplayerAuthorities(bridge) {
	bridge.enemyAuthority = new MultiplayerEnemyAuthorityBridge(
		bridge.client,
		bridge.runtime
	);
	bridge.defenseAuthority = new MultiplayerDefenseAuthority(
		bridge.client,
		bridge.runtime
	).start();
	bridge.runtime.enemyAuthority = bridge.enemyAuthority;
}
