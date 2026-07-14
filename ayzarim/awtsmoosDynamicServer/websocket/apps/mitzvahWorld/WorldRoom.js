// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldRoom.js
 * @description Coordinates players, creatures, social services, revision, and interest.
 * The Awtsmoos renews one shared world through many focused vessels; Awtsmoos.com
 * keeps the room below its size ceiling while every entity enters one projection.
 */
const { snapshotPlayer } = require('./PlayerEntity.js');
const { DEFINITION, NPCS } = require('./TefillinMission.js');
const { lookupWorldEntity } = require('./WorldEntityLookup.js');
const { worldEntitySnapshots } = require('./WorldEntitySnapshot.js');
const { releaseWorldMembership } = require('./WorldMembershipRelease.js');
const { createWorldRoomComposition } = require('./WorldRoomComposition.js');
const { projectWorldSnapshot } = require('./WorldSnapshotProjector.js');
class WorldRoom {
	constructor(id, options = {}) {
		this.id = id;
		this.nextEntity = 1;
		Object.assign(this, createWorldRoomComposition(this, options));
	}
	get revision() {
		return this.journal.revision;
	}
	join(client, profile) {
		const player = this.roster.join(client, profile);
		this.record('player.joined', { player: snapshotPlayer(player) });
		return player;
	}
	attach(client, playerId) {
		this.interest.release(client);
		const player = this.roster.attach(client, playerId);
		this.record('player.reconnected', { playerId });
		return player;
	}
	detach(client) {
		this.interest.release(client);
		const playerId = this.roster.detach(client);
		if (playerId) this.record('player.disconnected', { playerId });
		return playerId;
	}
	leave(client) {
		this.interest.release(client);
		const player = this.playerFor(client);
		releaseWorldMembership(this, player);
		const playerId = this.roster.leave(client);
		if (!playerId) return false;
		this.bots.remove(playerId);
		this.record('player.left', { playerId });
		return true;
	}
	removePlayer(playerId) {
		const player = this.players.get(playerId);
		if (player) releaseWorldMembership(this, player);
		if (!this.roster.remove(playerId)) return false;
		this.bots.remove(playerId);
		this.record('player.expired', { playerId });
		return true;
	}
	move(client, input) {
		return this.activity.move(client, input);
	}
	startQuest(client, questId) {
		return this.activity.startQuest(client, questId);
	}
	interact(client, command) {
		return this.activity.interact(client, command);
	}
	spawnBots(options) {
		return this.activity.spawnBots(options);
	}
	tickBots(steps) {
		return this.activity.tickBots(steps);
	}
	removeBot(botId) {
		return this.bots.removeBot(botId);
	}
	commandBot(botId, command) {
		return this.bots.commandBot(botId, command);
	}
	prepareInterestEntities() {
		const creatures = this.creatures.snapshots();
		return this.interest.prepare(worldEntitySnapshots(this.players, NPCS, creatures));
	}
	deltaFor(client, preparedEntities = this.prepareInterestEntities()) {
		return this.interest.project(
			client,
			this.playerFor(client),
			preparedEntities,
			this.revision
		);
	}
	entityById(entityId) {
		return lookupWorldEntity(this, entityId, NPCS);
	}
	snapshot() {
		return projectWorldSnapshot(this, NPCS, DEFINITION);
	}
	changesSince(revision) {
		return this.journal.since(revision);
	}
	clients() {
		return this.roster.clients();
	}
	playerFor(client) {
		return this.roster.playerFor(client);
	}
	entityId(prefix) {
		return `${prefix}-${this.nextEntity++}`;
	}
	record(type, payload) {
		this.journal.record(type, payload);
	}
}
module.exports = {
	WorldRoom
};
