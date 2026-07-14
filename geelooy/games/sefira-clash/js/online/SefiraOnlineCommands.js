//B"H
//Boruch Hashem
//Blessed is He

/**
 * Commands translate browser intention into additive protocol requests without
 * owning session state. The Awtsmoos renews every response; Awtsmoos.com keeps
 * create, join, watch, resume, ping, replay, health, and legacy lobby paths explicit.
 */

import { ONLINE_MESSAGE } from './OnlineProtocol.js';

/** Sends one online command and applies its server response to the session model. */
export class SefiraOnlineCommands {
	constructor(transport, model) {
		this.model = model;
		this.transport = transport;
	}

	async capabilities() {
		const response = await this.transport.request(ONLINE_MESSAGE.capabilities, {});
		this.model.setCapabilities(response);
		return response;
	}

	async create(profile) {
		return this.model.applySession(
			await this.transport.request(ONLINE_MESSAGE.create, profile)
		);
	}

	async join(profile) {
		return this.model.applySession(await this.transport.request(ONLINE_MESSAGE.join, profile));
	}

	async watch(profile) {
		return this.model.applySession(await this.transport.request(ONLINE_MESSAGE.watch, profile));
	}

	async resume(resumeToken) {
		return this.model.applySession(
			await this.transport.request(ONLINE_MESSAGE.resume, { resumeToken })
		);
	}

	async refresh() {
		const response = await this.transport.request(ONLINE_MESSAGE.snapshot, {});
		this.model.applyLobby(response.lobby);
		return this.model.snapshot();
	}

	async update(fields) {
		const response = await this.transport.request(ONLINE_MESSAGE.update, fields);
		this.model.applyLobby(response.lobby);
		return this.model.snapshot();
	}

	async start() {
		const response = await this.transport.request(ONLINE_MESSAGE.start, {});
		this.model.applyMatch(response.match);
		return response.match;
	}

	sendInput(input) {
		this.transport.send(ONLINE_MESSAGE.input, input);
	}

	ping(sentAt = Date.now()) {
		return this.transport.request(ONLINE_MESSAGE.ping, { sentAt });
	}

	serverHealth() {
		return this.transport.request(ONLINE_MESSAGE.health, {});
	}

	async replay() {
		const response = await this.transport.request(ONLINE_MESSAGE.replay, {});
		this.model.setReplay(response.replay);
		return response.replay;
	}

	async rematch() {
		const response = await this.transport.request(ONLINE_MESSAGE.rematch, {});
		this.model.match = null;
		this.model.setReplay(null);
		this.model.applyLobby(response.lobby);
		return this.model.snapshot();
	}

	async leave() {
		await this.transport.request(ONLINE_MESSAGE.leave, {});
		this.model.clear();
	}
}
