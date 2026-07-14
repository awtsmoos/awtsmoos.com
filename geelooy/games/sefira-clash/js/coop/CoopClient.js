//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative client wraps the established realtime transport without creating a new
 * WebSocket dialect. The Awtsmoos renews each request and snapshot; Awtsmoos.com keeps
 * private resume identity local while exposing only authoritative server state.
 */

import { RealtimeClient } from '../online/RealtimeClient.js';
import { sameOriginSocketUrl } from '../online/ProtocolEnvelope.js';
import { COOP_EVENT, COOP_MESSAGE, COOP_STORAGE } from './CoopProtocol.js';

export class CoopClient {
	constructor(url = sameOriginSocketUrl()) {
		this.transport = new RealtimeClient({
			application: 'sefira-clash',
			version: 1,
			url
		});
		this.listeners = new Set();
		this.state = null;
		this.playerId = null;
		this.resumeToken = localStorage.getItem(COOP_STORAGE.resumeToken) || '';
		this.bindEvents();
	}

	onState(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	async create(profile) {
		return this.acceptMembership(await this.transport.request(COOP_MESSAGE.create, profile));
	}

	async join(profile) {
		return this.acceptMembership(await this.transport.request(COOP_MESSAGE.join, profile));
	}

	async resume() {
		if (!this.resumeToken) return null;
		return this.acceptMembership(
			await this.transport.request(COOP_MESSAGE.resume, {
				resumeToken: this.resumeToken
			})
		);
	}

	async update(fields) {
		return this.acceptState((await this.transport.request(COOP_MESSAGE.update, fields)).coop);
	}

	async start() {
		return this.acceptMatch((await this.transport.request(COOP_MESSAGE.start)).coop);
	}

	async snapshot() {
		return this.acceptState((await this.transport.request(COOP_MESSAGE.snapshot)).coop);
	}

	async rematch() {
		return this.acceptState((await this.transport.request(COOP_MESSAGE.rematch)).coop);
	}

	async leave() {
		const result = await this.transport.request(COOP_MESSAGE.leave);
		this.clearMembership();
		return result;
	}

	sendInput(input) {
		this.transport.send(COOP_MESSAGE.input, input);
	}

	close() {
		this.transport.close();
	}

	bindEvents() {
		this.transport.on(COOP_EVENT.changed, payload => this.acceptState(payload.coop));
		this.transport.on(COOP_EVENT.snapshot, payload => this.acceptMatch(payload.coop));
	}

	acceptMembership(payload) {
		this.playerId = payload.playerId;
		this.resumeToken = payload.resumeToken;
		localStorage.setItem(COOP_STORAGE.resumeToken, this.resumeToken);
		localStorage.setItem(COOP_STORAGE.joinCode, payload.coop.joinCode);
		return this.acceptState(payload.coop);
	}

	acceptState(coop) {
		this.state = coop;
		this.emit();
		return coop;
	}

	acceptMatch(match) {
		if (!this.state) return match;
		this.state = { ...this.state, phase: match.phase, match };
		this.emit();
		return match;
	}

	clearMembership() {
		this.state = null;
		this.playerId = null;
		this.resumeToken = '';
		localStorage.removeItem(COOP_STORAGE.resumeToken);
		localStorage.removeItem(COOP_STORAGE.joinCode);
		this.emit();
	}

	emit() {
		for (const listener of this.listeners) listener(this.state);
	}
}
