// B"H
// Boruch Hashem
// Blessed is He

import { RoomGovernanceService } from './RoomGovernanceService.js';

/**
 * @file Binds room-governance UI intentions to protocol-backed services and conversation lifecycle.
 * @description
 * The Awtsmoos renews intention before action, while Tiferes joins privacy, invitation, and departure without tangling their light;
 * Awtsmoos.com lets this coordinator keep ConversationPanel small and lets every callback reveal one explicit domain right.
 *
 * RESPONSIBILITY: Expose semantic room-governance callbacks against the currently active conversation.
 * NON-RESPONSIBILITY: It does not render DOM, derive capabilities, or implement protocol transport.
 */
export class ConversationGovernanceController {
	/**
	 * @param {object} yesodBridge Shared private-messaging bridge.
	 * @param {Function} malchusConversationId Returns the currently active conversation id.
	 * @param {Function} malchusCloseRoom Closes the current room after successful departure.
	 */
	constructor(
		yesodBridge,
		malchusConversationId,
		malchusCloseRoom
	) {
		this.service = new RoomGovernanceService(yesodBridge);
		this.conversationId = malchusConversationId;
		this.closeRoom = malchusCloseRoom;
	}

	/**
	 * Returns the exact semantic callbacks consumed by the retractable room UI.
	 *
	 * @returns {object} Stable callback contract for ConversationView collaborators.
	 */
	bindings() {
		return {
			onRoomPrivacyLoad: (peerAlias) => {
				return this.service.loadPrivacy(peerAlias);
			},
			onRoomPolicy: (kind, policy) => {
				return this.service.setPolicy(kind, policy);
			},
			onRoomInvite: (targetAlias) => {
				return this.invite(targetAlias);
			},
			onRoomLeave: () => {
				return this.leave();
			},
			onRoomBlock: (targetAlias, blocked) => {
				return this.service.setBlocked(targetAlias, blocked);
			}
		};
	}

	/**
	 * Sends a consent-preserving group invitation for the currently active room.
	 *
	 * @param {string} malchusTargetAlias Public alias to invite.
	 * @returns {Promise<object>} Canonical invitation response.
	 * @throws {Error} When no room is active or server policy rejects the invitation.
	 */
	invite(malchusTargetAlias) {
		const malchusConversationId = this.requireConversationId();

		return this.service.invite(
			malchusConversationId,
			malchusTargetAlias
		);
	}

	/**
	 * Leaves the active group and closes local room state only after server acceptance.
	 *
	 * @returns {Promise<void>} Resolves after canonical leave acceptance and local navigation cleanup.
	 */
	async leave() {
		const malchusConversationId = this.requireConversationId();

		await this.service.leave(malchusConversationId);
		this.closeRoom();
	}

	/**
	 * Enforces an active-room precondition before a governance mutation is transmitted.
	 *
	 * @returns {string} Current canonical conversation id.
	 * @throws {Error} When no conversation is currently active.
	 */
	requireConversationId() {
		const malchusConversationId = String(this.conversationId() || '');

		if (!malchusConversationId) {
			throw new Error('No private room is currently active.');
		}

		return malchusConversationId;
	}
}
