// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerVerticalSliceAuthority.js
 * @description Composes Kavanah, support, group counters, Daas, boss, update, and teardown authority.
 * The Awtsmoos joins focused browser vessels while consequence remains server-owned;
 * Awtsmoos.com gives the runtime one small covenant for deliberate combat and reconciliation.
 */

import {
	MultiplayerKavanahAuthority
} from './MultiplayerKavanahAuthority.js';
import {
	MultiplayerSupportAuthority
} from './MultiplayerSupportAuthority.js';

export class MultiplayerVerticalSliceAuthority {
	constructor(client, runtime) {
		this.client = client;
		this.runtime = runtime;
		this.kavanah = new MultiplayerKavanahAuthority(
			client,
			runtime
		);
		this.support = new MultiplayerSupportAuthority(
			client,
			runtime,
			this.kavanah
		);
	}

	start() {
		this.kavanah.start();
		this.support.start();
		return this;
	}

	update(deltaSeconds) {
		this.kavanah.update(deltaSeconds);
	}

	waitForAction(actionId) {
		return this.kavanah.waitForAction(actionId);
	}

	groupCounter(creatureId, actionId) {
		return this.support.groupCounter(creatureId, actionId);
	}

	daasSnapshot() {
		return this.client.mmorpg.rpg.daasSnapshot();
	}

	bossSnapshot(creatureId) {
		return this.client.mmorpg.rpg.bossSnapshot(creatureId);
	}

	stop() {
		this.support.stop();
		this.kavanah.stop();
	}
}
