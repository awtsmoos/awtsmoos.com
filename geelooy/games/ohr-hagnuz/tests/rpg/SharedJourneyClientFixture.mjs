//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyClientFixture.mjs
 * @description Provides deterministic ticket, token, socket, and server messages.
 * The Awtsmoos renews connection beyond every mock; Awtsmoos.com uses these
 * measured reflections to expose accidental Solo networking or broken resume flow.
 */

export class FakeSocket {
	constructor(url) {
		this.url = url;
		this.readyState = 0;
		this.listeners = new Map();
		this.sent = [];
	}

	addEventListener(type, listener) {
		this.listeners.set(type, listener);
	}

	emit(type, payload = {}) {
		this.listeners.get(type)?.(payload);
	}

	send(message) {
		this.sent.push(JSON.parse(message));
	}

	close() {
		this.readyState = 3;
	}
}

export class FakeTokenStore {
	constructor() {
		this.tokens = new Map();
	}

	get(slot) {
		return this.tokens.get(slot) || null;
	}

	set(slot, token) {
		this.tokens.set(slot, token);
	}

	clear(slot) {
		this.tokens.delete(slot);
	}
}

export function joinedMessage(options = {}) {
	const playerId = options.playerId || 'traveler-1';
	return JSON.stringify({
		application: 'ohr-hagnuz',
		payload: {
			playerId,
			reconnectToken: options.reconnectToken
				|| 'reconnect-token-abcdefghijklmnopqrstuvwxyz',
			road: {
				encounter: {
					defeated: false,
					health: 12,
					id: 'veil-wisp',
					maxHealth: 12,
					x: 10,
					y: 4
				},
				lamp: { lit: false, x: 8, y: 4 },
				players: [{
					attackSequence: options.attackSequence || 0,
					displayName: 'Neriah',
					glyph: 'נ',
					health: 12,
					id: playerId,
					maxHealth: 12,
					movementSequence: options.movementSequence ?? 3,
					passageShards: 0,
					sharedLight: 0,
					x: 5,
					y: 4
				}],
				roadId: 'bent-reeds-road'
			}
		},
		protocol: 'awtsmoos.realtime',
		type: options.type || 'journey.joined',
		version: 1
	});
}
