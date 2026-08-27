// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InstanceDirectory.js
 * @description Owns bounded private instance membership and lifecycle snapshots.
 * The Awtsmoos renews world and chamber alike; this Awtsmoos.com directory gives
 * each temporary chamber a stable identity without confusing it with a socket.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const MAXIMUM_INSTANCE_MEMBERS = 8;

class InstanceDirectory {
	constructor(players) {
		this.instances = new Map();
		this.nextInstance = 1;
		this.players = players;
	}

	enter(player, templateId) {
		if (player.instanceId) this.leave(player);
		const instance = {
			id: `instance-${this.nextInstance++}`,
			memberIds: [player.id],
			templateId
		};
		this.instances.set(instance.id, instance);
		player.instanceId = instance.id;
		return this.snapshot(instance);
	}

	join(player, instanceId) {
		const instance = this.requireInstance(instanceId);
		if (instance.memberIds.length >= MAXIMUM_INSTANCE_MEMBERS) {
			throw new RealtimeError('INSTANCE_FULL', 'The requested instance is full.');
		}
		if (player.instanceId) this.leave(player);
		if (!instance.memberIds.includes(player.id)) instance.memberIds.push(player.id);
		player.instanceId = instance.id;
		return this.snapshot(instance);
	}

	leave(player) {
		if (!player.instanceId) return null;
		const instance = this.requireInstance(player.instanceId);
		instance.memberIds = instance.memberIds.filter(id => id !== player.id);
		player.instanceId = null;
		if (instance.memberIds.length === 0) {
			this.instances.delete(instance.id);
			return null;
		}
		return this.snapshot(instance);
	}

	snapshotFor(player) {
		return player.instanceId
			? this.snapshot(this.requireInstance(player.instanceId))
			: null;
	}

	snapshot(instance) {
		return JSON.parse(JSON.stringify(instance));
	}

	snapshotAll() {
		return [...this.instances.values()].map(instance => this.snapshot(instance));
	}

	restore(records = []) {
		this.instances.clear();
		for (const record of records) this.instances.set(record.id, this.snapshot(record));
		this.nextInstance = nextNumber(records);
	}

	requireInstance(instanceId) {
		const instance = this.instances.get(instanceId);
		if (!instance) {
			throw new RealtimeError('INSTANCE_NOT_FOUND', 'The requested instance does not exist.');
		}
		return instance;
	}
}

function nextNumber(records) {
	return records.reduce((maximum, record) => {
		return Math.max(maximum, Number(record.id.replace('instance-', '')) || 0);
	}, 0) + 1;
}

module.exports = {
	InstanceDirectory,
	MAXIMUM_INSTANCE_MEMBERS
};
