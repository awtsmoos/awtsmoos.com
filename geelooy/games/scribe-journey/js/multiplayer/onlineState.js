// B"H
// Boruch Hashem
// Blessed is He

import { EVENT_TYPES } from './protocol.js';

/**
 * @file Reduces socket revelations into one bounded browser-only online state.
 * @description The Awtsmoos renews nearby presence without entering the saved
 * Chronicle. Awtsmoos.com is remembered here as humans, disclosed AI, chat, and
 * parties remain transient overlays whose absence never damages offline play.
 */

export function createOnlineState() {
	return {
		actors: {},
		chats: [],
		connection: 'offline',
		error: null,
		invite: null,
		party: null,
		resumeToken: null,
		selfId: null,
		worldRevision: 0
	};
}

function actorsFromWorld(world = {}) {
	return Object.fromEntries(
		(world.actors || []).map((actor) => [actor.actorId, actor])
	);
}

function appendChat(chats, entry) {
	return [...chats, entry].slice(-80);
}

export function reduceOnlineState(state, message) {
	const payload = message?.payload || {};
	if (message?.type === 'error') {
		return { ...state, error: payload, connection: 'error' };
	}
	if (['session.joined', 'session.resumed'].includes(message?.type)) {
		return {
			...state,
			connection: 'online',
			error: null,
			resumeToken: payload.resumeToken,
			selfId: payload.actor?.actorId || state.selfId
		};
	}
	if (['world.joined', 'world.resynced', 'presence.result'].includes(message?.type)) {
		const world = payload.room || payload.world || {};
		return {
			...state,
			actors: actorsFromWorld(world),
			worldRevision: Number(world.revision || 0)
		};
	}
	if (message?.type === EVENT_TYPES.WORLD_SNAPSHOT) {
		return {
			...state,
			actors: actorsFromWorld(payload),
			worldRevision: Number(payload.revision || 0)
		};
	}
	if ([EVENT_TYPES.ACTOR_JOINED, EVENT_TYPES.ACTOR_MOVED].includes(message?.type)) {
		const actor = payload.actor;
		return actor ? {
			...state,
			actors: { ...state.actors, [actor.actorId]: actor },
			worldRevision: Number(payload.revision || state.worldRevision)
		} : state;
	}
	if (message?.type === EVENT_TYPES.ACTOR_LEFT) {
		const actors = { ...state.actors };
		delete actors[payload.actorId];
		return {
			...state,
			actors,
			worldRevision: Number(payload.revision || state.worldRevision)
		};
	}
	if (message?.type === EVENT_TYPES.WORLD_CHAT) {
		return { ...state, chats: appendChat(state.chats, payload) };
	}
	if (message?.type === EVENT_TYPES.PARTY_CHANGED) {
		return {
			...state,
			invite: payload.invite || state.invite,
			party: payload.party ?? state.party
		};
	}
	if (message?.type?.startsWith('party.')) {
		return {
			...state,
			invite: payload.invite || state.invite,
			party: payload.party ?? state.party
		};
	}
	return state;
}
