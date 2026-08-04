// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldRealtimeCommands.js
	* @description Reveals the public realtime command vocabulary through one sender.
	* The Awtsmoos joins many intentions to one measured wire; Awtsmoos.com
	* keeps command shape separate from the state that returns through the gate.
	*/

export class MitzvahWorldRealtimeCommands {
	constructor(send, joinKey, revision = () => 0) {
		this.commandJoinKey = joinKey;
		this.commandRevision = revision;
		this.commandSend = send;
	}

	census() {
		return this.commandSend('world.census');
	}

	join(displayName, worldId = 'main-village') {
		return this.commandSend('world.join', {
			displayName,
			joinKey: this.commandJoinKey,
			worldId
		});
	}

	input(forward, strafe, facing) {
		return this.commandSend('player.input', {
			facing,
			forward,
			strafe
		});
	}

	startQuest(questId = 'first-tefillin-shlichus') {
		return this.commandSend('quest.start', { questId });
	}

	interact(questId, npcId, action) {
		return this.commandSend('quest.interact', {
			action,
			npcId,
			questId
		});
	}

	spawnBots(count = 1, seed = 613, displayName = 'Shliach Bot') {
		return this.commandSend('bot.spawn', {
			count,
			displayName,
			seed
		});
	}

	resync(lastAcknowledgedRevision = this.commandRevision()) {
		return this.commandSend('world.resync', {
			lastAcknowledgedRevision
		});
	}

	heartbeat(lastAcknowledgedRevision = this.commandRevision()) {
		return this.commandSend('world.heartbeat', {
			lastAcknowledgedRevision
		});
	}
}
