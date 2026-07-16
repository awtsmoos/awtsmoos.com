//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OhrHagnuzDispatcher.js
 * @description Routes authenticated journey commands and persists every mutation.
 * The Awtsmoos renews command, world, and witness together; Awtsmoos.com does
 * not acknowledge movement, lamp, or battle until server truth is recorded.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { broadcastRoom } = require('./RoadBroadcaster.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const {
	validateAttack,
	validateInteraction,
	validateJoin,
	validateMove,
	validateResume
} = require('./validation.js');

class OhrHagnuzDispatcher {
	constructor(sessions) {
		this.sessions = sessions;
	}

	async handle(context, request) {
		if (request.type === MESSAGE_TYPES.JOIN) {
			return this.join(context, validateJoin(request.payload));
		}
		if (request.type === MESSAGE_TYPES.RESUME) {
			return this.resume(context, validateResume(request.payload));
		}
		const room = this.sessions.directory.forClient(context.client);
		if (request.type === MESSAGE_TYPES.SNAPSHOT) {
			return result(RESPONSE_TYPES.SNAPSHOT, { road: room.snapshot() });
		}
		if (request.type === MESSAGE_TYPES.MOVE) {
			const player = room.move(context.client, validateMove(request.payload));
			await this.sessions.persistClient(context.client);
			broadcastRoom(room);
			return result(RESPONSE_TYPES.MOVED, projection(room, player));
		}
		if (request.type === MESSAGE_TYPES.INTERACT) {
			validateInteraction(request.payload);
			const interaction = room.interact(context.client);
			await this.sessions.persistClient(context.client);
			broadcastRoom(room);
			return result(RESPONSE_TYPES.INTERACTED, {
				interaction,
				road: room.snapshot()
			});
		}
		if (request.type === MESSAGE_TYPES.ATTACK) {
			const combat = room.attack(context.client, validateAttack(request.payload));
			const attacker = room.player(context.client);
			await this.sessions.persistPlayers(uniquePlayers([
				attacker,
				...combat.rewardedPlayers
			]));
			broadcastRoom(room);
			return result(RESPONSE_TYPES.ATTACKED, {
				combat: withoutPrivatePlayers(combat),
				road: room.snapshot()
			});
		}
		if (request.type === MESSAGE_TYPES.LEAVE) {
			const detached = this.sessions.leave(context.client);
			broadcastRoom(detached?.room);
			return result(RESPONSE_TYPES.LEFT, { roadId: detached?.room?.id || null });
		}
		throw new RealtimeError('UNKNOWN_MESSAGE', `Unknown Ohr HaGnuz message: ${request.type}`);
	}

	async join(context, payload) {
		const joined = await this.sessions.join(context, payload);
		broadcastRoom(joined.room);
		return result(RESPONSE_TYPES.JOINED, {
			playerId: joined.player.id,
			reconnectToken: joined.reconnectToken,
			road: joined.room.snapshot()
		});
	}

	async resume(context, payload) {
		const joined = await this.sessions.resume(context, payload);
		broadcastRoom(joined.room);
		return result(RESPONSE_TYPES.RESUMED, {
			playerId: joined.player.id,
			reconnectToken: joined.reconnectToken,
			road: joined.room.snapshot()
		});
	}
}

function projection(room, player) {
	return { player: player.snapshot(), road: room.snapshot() };
}

function result(type, payload) {
	return { payload, type };
}

function uniquePlayers(players) {
	return [...new Map(players.map(player => [player.id, player])).values()];
}

function withoutPrivatePlayers(combat) {
	const { rewardedPlayers, ...safe } = combat;
	return safe;
}

module.exports = { OhrHagnuzDispatcher };
