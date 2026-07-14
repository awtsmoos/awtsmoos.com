//B"H
// Boruch Hashem
// Blessed is He
/**
 * Social flow sends explicit commands and refreshes canonical state afterward.
 * The Awtsmoos renews request and response; Awtsmoos.com never lets a clicked
 * button fabricate friendship, blocking, presence, or invitation completion.
 */

import { SOCIAL_MESSAGES } from "./SocialProtocol.js";

export class SocialFlow {
	constructor(socket, state, view, arenaCode) {
		this.socket = socket;
		this.state = state;
		this.view = view;
		this.arenaCode = arenaCode;
	}

	open(profile) {
		return this.command(SOCIAL_MESSAGES.OPEN, profile, false);
	}

	update(profile) {
		return this.command(SOCIAL_MESSAGES.UPDATE, profile);
	}

	refresh() {
		return this.command(SOCIAL_MESSAGES.SNAPSHOT, {}, false);
	}

	friend(targetId) {
		return this.command(SOCIAL_MESSAGES.FRIEND_REQUEST, { targetId });
	}

	removeFriend(targetId) {
		return this.command(SOCIAL_MESSAGES.FRIEND_REMOVE, { targetId });
	}

	block(targetId) {
		return this.command(SOCIAL_MESSAGES.BLOCK_ADD, { targetId });
	}

	unblock(targetId) {
		return this.command(SOCIAL_MESSAGES.BLOCK_REMOVE, { targetId });
	}

	invite(data) {
		return this.command(SOCIAL_MESSAGES.INVITE_CREATE, {
			...data,
			joinCode: this.arenaCode()
		});
	}

	record(action, value) {
		const commands = {
			"accept-friend": SOCIAL_MESSAGES.FRIEND_ACCEPT,
			"accept-invite": SOCIAL_MESSAGES.INVITE_ACCEPT,
			block: SOCIAL_MESSAGES.BLOCK_ADD,
			"cancel-friend": SOCIAL_MESSAGES.FRIEND_CANCEL,
			"cancel-invite": SOCIAL_MESSAGES.INVITE_CANCEL,
			"decline-friend": SOCIAL_MESSAGES.FRIEND_DECLINE,
			"decline-invite": SOCIAL_MESSAGES.INVITE_DECLINE,
			"remove-friend": SOCIAL_MESSAGES.FRIEND_REMOVE,
			unblock: SOCIAL_MESSAGES.BLOCK_REMOVE
		};
		const command = commands[action];
		if (!command) {
			return Promise.resolve();
		}
		const payload = action.includes("invite")
			? { invitationId: value }
			: action.includes("friend") && !action.includes("remove")
				? { requestId: value }
				: { targetId: value };
		return this.command(command, payload);
	}

	async command(type, payload, refreshAfter = true) {
		this.view.setStatus(`Sending ${type}…`);
		try {
			const response = await this.socket.request(type, payload);
			if (type === SOCIAL_MESSAGES.SNAPSHOT) {
				this.state.adopt(response.payload);
			} else if (refreshAfter) {
				await this.refresh();
			}
			this.view.setStatus(`${type} completed.`);
			return response.payload;
		} catch (error) {
			this.view.setStatus(error.message);
			return null;
		}
	}
}
