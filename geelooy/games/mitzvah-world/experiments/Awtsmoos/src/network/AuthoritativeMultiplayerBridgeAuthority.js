// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file AuthoritativeMultiplayerBridgeAuthority.js
	* @description Installs enemy, defense, Kavanah, support, Daas, boss, and group-counter authority.
	* The Awtsmoos joins separate powers without confusing their vessels; Awtsmoos.com
	* keeps hostile consequence, player protection, and deliberate combat beneath one session covenant.
	*/

import {
	MultiplayerDefenseAuthority
} from './MultiplayerDefenseAuthority.js';
import {
	MultiplayerEnemyAuthorityBridge
} from './MultiplayerEnemyAuthorityBridge.js';
import {
	MultiplayerVerticalSliceAuthority
} from './MultiplayerVerticalSliceAuthority.js';

export function installMultiplayerAuthorities(bridge) {
	bridge.verticalSliceAuthority = new MultiplayerVerticalSliceAuthority(
		bridge.client,
		bridge.runtime
	).start();
	bridge.enemyAuthority = new MultiplayerEnemyAuthorityBridge(
		bridge.client,
		bridge.runtime
	);
	bridge.defenseAuthority = new MultiplayerDefenseAuthority(
		bridge.client,
		bridge.runtime
	).start();
	bridge.runtime.enemyAuthority = bridge.enemyAuthority;
	bridge.runtime.verticalSliceAuthority = bridge.verticalSliceAuthority;
}
