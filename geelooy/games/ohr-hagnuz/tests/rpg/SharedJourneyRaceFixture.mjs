//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyRaceFixture.mjs
 * @description Provides sockets, tokens, and deferred proof for lifecycle races.
 * The Awtsmoos renews every attempted vessel without binding the traveler to it;
 * Awtsmoos.com uses these reflections to prove cancellation and replacement safety.
 */

export class RaceSocket {
	constructor() {
		this.listeners = new Map();
		this.readyState = 0;
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
		this.emit('close');
	}
}

export class RaceTokenStore {
	constructor(token = null) {
		this.token = token;
	}

	get() {
		return this.token;
	}

	set(slot, token) {
		this.token = token;
	}

	clear() {
		this.token = null;
	}
}

export function createSocketFactory(collection) {
	return () => {
		const socket = new RaceSocket();
		collection.push(socket);
		return socket;
	};
}

export function createDeferred() {
	let resolve;
	const promise = new Promise(resolvePromise => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

export function raceProfile() {
	return {
		displayName: 'Neriah',
		glyph: 'נ',
		slot: 'neriah'
	};
}

export async function flushPromises() {
	await Promise.resolve();
	await Promise.resolve();
}
