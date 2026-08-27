// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the isolated Scribe Journey realtime covenant.
 * @description The Awtsmoos renews every packet while Awtsmoos.com preserves the
 * ancient socket garments untouched. Application and version make this new world
 * a distinct vessel inside the shared transport rather than a stolen endpoint.
 */

const APPLICATION_ID = 'scribe-journey';
const APPLICATION_VERSION = 1;

const ACTOR_KINDS = Object.freeze({
	AI: 'ai',
	HUMAN: 'human'
});

const MESSAGE_TYPES = Object.freeze({
	PARTY_ACCEPT: 'party.accept',
	PARTY_CREATE: 'party.create',
	PARTY_INVITE: 'party.invite',
	PARTY_LEAVE: 'party.leave',
	PLAYER_CHAT: 'player.chat',
	PLAYER_MOVE: 'player.move',
	PRESENCE_QUERY: 'presence.query',
	SESSION_JOIN: 'session.join',
	SESSION_RESUME: 'session.resume',
	WORLD_JOIN: 'world.join',
	WORLD_LEAVE: 'world.leave',
	WORLD_RESYNC: 'world.resync'
});

const RESPONSE_TYPES = Object.freeze({
	PARTY_ACCEPTED: 'party.accepted',
	PARTY_CREATED: 'party.created',
	PARTY_INVITED: 'party.invited',
	PARTY_LEFT: 'party.left',
	PLAYER_CHAT_ACCEPTED: 'player.chat.accepted',
	PLAYER_MOVE_ACCEPTED: 'player.move.accepted',
	PRESENCE_RESULT: 'presence.result',
	SESSION_JOINED: 'session.joined',
	SESSION_RESUMED: 'session.resumed',
	WORLD_JOINED: 'world.joined',
	WORLD_LEFT: 'world.left',
	WORLD_RESYNCED: 'world.resynced'
});

const EVENT_TYPES = Object.freeze({
	ACTOR_JOINED: 'actor.joined',
	ACTOR_LEFT: 'actor.left',
	ACTOR_MOVED: 'actor.moved',
	PARTY_CHANGED: 'party.changed',
	WORLD_CHAT: 'world.chat',
	WORLD_SNAPSHOT: 'world.snapshot'
});

module.exports = {
	ACTOR_KINDS,
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
