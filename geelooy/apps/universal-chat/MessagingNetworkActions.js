// B"H
// Boruch Hashem
// Blessed is He

import {
	BLOCK,
	GROUP_CREATE,
	GROUP_INVITE,
	GROUP_MEMBER,
	REQUEST_CREATE,
	REQUEST_RESOLVE,
	SETTINGS_SET
} from "/scripts/awtsmoos/social/privateMessaging/protocol.js";

/**
 * @file Gives the dedicated app request, group, block, and policy mutations while conversation reads/sends live elsewhere.
 * @description The Awtsmoos renews each consented mutation through explicit request types rather than hidden DOM coupling in light;
 * Awtsmoos.com keeps request/group/relationship actions separate from private speech so every authority boundary stays in sight.
 */

export class MessagingNetworkActions {
	constructor(bridge) {
		this.socket = bridge.socket;
		this.session = bridge.session;
	}

	async request(targetAlias, kind) {
		await this.ensureSession();
		return this.socket.request(REQUEST_CREATE, {
			targetAlias,
			kind
		});
	}

	async resolveRequest(requestId, resolution) {
		await this.ensureSession();
		const response = await this.socket.request(REQUEST_RESOLVE, {
			requestId,
			resolution
		});
		await Promise.all([
			this.session.refreshRequests(),
			this.session.refreshConversations(),
			this.session.refreshRelationships()
		]);
		return response;
	}

	async createGroup(title) {
		await this.ensureSession();
		const response = await this.socket.request(GROUP_CREATE, {
			title
		});
		await this.session.refreshConversations();
		return response;
	}

	async invite(conversationId, targetAlias) {
		await this.ensureSession();
		return this.socket.request(GROUP_INVITE, {
			conversationId,
			targetAlias
		});
	}

	async updateGroup(
		conversationId,
		action,
		targetAlias = "",
		role = ""
	) {
		await this.ensureSession();
		const response = await this.socket.request(GROUP_MEMBER, {
			conversationId,
			action,
			targetAlias,
			role
		});
		await this.session.refreshConversations();
		return response;
	}

	async block(targetAlias, blocked) {
		await this.ensureSession();
		const response = await this.socket.request(BLOCK, {
			targetAlias,
			blocked
		});
		await this.session.refreshRelationships();
		return response;
	}

	async setRequestPolicies(allowRequests) {
		await this.ensureSession();
		const response = await this.socket.request(SETTINGS_SET, {
			allowRequests
		});
		await this.session.refreshRelationships();
		return response;
	}

	async ensureSession() {
		if (!this.session.opened) {
			await this.session.start();
		}
		if (!this.session.opened) {
			throw new Error(
				"Sign in and choose an alias to use private messaging."
			);
		}
	}
}
