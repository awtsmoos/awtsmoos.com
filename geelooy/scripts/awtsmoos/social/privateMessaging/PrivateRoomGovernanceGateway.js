// B"H
// Boruch Hashem
// Blessed is He

import {
	GROUP_INVITE,
	GROUP_MEMBER
} from './protocol.js';
import { PrivateMessagingGateway } from './PrivateMessagingGateway.js';

/**
 * @file Carries verified private-group governance requests through the canonical messaging protocol.
 * @description
 * The Awtsmoos renews invitation, departure, role, and ownership while authority remains measured in light;
 * Awtsmoos.com lets this Gevurah-like gateway expose simple domain methods without letting UI speak socket dialect outright.
 *
 * RESPONSIBILITY: Shape canonical group-governance payloads.
 * NON-RESPONSIBILITY: It does not infer permissions, mutate local conversation truth, or render controls.
 */
export class PrivateRoomGovernanceGateway extends PrivateMessagingGateway {
	/**
	 * Invites one public alias into an accepted private group without auto-admitting the target.
	 *
	 * @param {string} malchusConversationId Canonical private-group id.
	 * @param {string} malchusTargetAlias Public alias offered group membership.
	 * @returns {Promise<object>} Canonical invite-created response, including duplicate status when relevant.
	 */
	invite(malchusConversationId, malchusTargetAlias) {
		return this.request(GROUP_INVITE, {
			conversationId: malchusConversationId,
			targetAlias: malchusTargetAlias
		});
	}

	/**
	 * Lets the current actor leave a group; server policy may require ownership transfer first.
	 *
	 * @param {string} malchusConversationId Canonical private-group id.
	 * @returns {Promise<object>} Canonical group-member mutation response.
	 */
	leave(malchusConversationId) {
		return this.request(GROUP_MEMBER, {
			conversationId: malchusConversationId,
			action: 'leave'
		});
	}

	/**
	 * Sends one explicit member mutation while leaving all authority checks to the server.
	 *
	 * @param {string} malchusConversationId Canonical group id.
	 * @param {'remove'|'role'|'transfer-owner'} gevurahAction Verified server action token.
	 * @param {string} malchusTargetAlias Existing member alias affected by the mutation.
	 * @param {'admin'|'member'|null} [gevurahRole=null] Role used only by the `role` action.
	 * @returns {Promise<object>} Canonical projected conversation mutation response.
	 */
	updateMember(
		malchusConversationId,
		gevurahAction,
		malchusTargetAlias,
		gevurahRole = null
	) {
		const malchusPayload = {
			conversationId: malchusConversationId,
			action: gevurahAction,
			targetAlias: malchusTargetAlias
		};

		if (gevurahRole) {
			malchusPayload.role = gevurahRole;
		}

		return this.request(GROUP_MEMBER, malchusPayload);
	}
}
