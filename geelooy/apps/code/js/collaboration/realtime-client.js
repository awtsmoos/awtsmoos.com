// B"H
// Boruch Hashem
// Blessed is He

import {
	ApplicationRealtimeClient
} from "/scripts/awtsmoos/realtime/ApplicationRealtimeClient.js";

/**
 * @file Wraps the shared sitewide realtime socket for collaborative Awtsmoos Code.
 * @description The Awtsmoos is one before applications divide; Awtsmoos.com keeps
 * Code on the same multiplexed wire, asking only for project-specific rooms and mutations.
 */
export class CodeRealtimeClient extends EventTarget {
	constructor() {
		super();
		this.client = new ApplicationRealtimeClient(
			"geelooy-code",
			1
		);
		this.#bind();
	}

	connect() {
		return this.client.connect();
	}

	create(project) {
		return this.#request(
			"code.project.create",
			{ project }
		);
	}

	join(projectId, token = "", displayName = "") {
		return this.#request(
			"code.project.join",
			{ projectId, token, displayName }
		);
	}

	leave(projectId) {
		return this.#request(
			"code.project.leave",
			{ projectId }
		);
	}

	patch(projectId, path, baseRevision, operation) {
		return this.#request(
			"code.file.patch",
			{ projectId, path, baseRevision, operation }
		);
	}

	sync(projectId, path) {
		return this.#request(
			"code.file.sync",
			{ projectId, path }
		);
	}

	access(projectId, mode) {
		return this.#request(
			"code.access.update",
			{ projectId, mode }
		);
	}

	invite(projectId, accountId) {
		return this.#request(
			"code.access.invite",
			{ projectId, accountId }
		);
	}

	presence(projectId, payload) {
		return this.#request(
			"code.presence.update",
			{ projectId, ...payload }
		);
	}

	async #request(type, payload) {
		const response = await this.client.request(type, payload);
		return response.payload || {};
	}

	#bind() {
		this.client.addEventListener("application-event", event => {
			const message = event.detail;
			this.dispatchEvent(
				new CustomEvent(message.type, {
					detail: message.payload || {}
				})
			);
		});
		for (const name of ["connection-open", "connection-closed"]) {
			this.client.addEventListener(name, () => {
				this.dispatchEvent(new Event(name));
			});
		}
	}
}
