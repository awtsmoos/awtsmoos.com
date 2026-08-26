// B"H
// Boruch Hashem
// Blessed is He

import { PrivateMessagingSettingsGateway } from '/scripts/awtsmoos/social/privateMessaging/PrivateMessagingSettingsGateway.js';
import { PrivateRoomGovernanceGateway } from '/scripts/awtsmoos/social/privateMessaging/PrivateRoomGovernanceGateway.js';

/**
 * @file Presents one small Social Hub room-governance API over focused private-messaging gateways.
 * @description
 * The Awtsmoos renews many protocol events while Tiferes lets them appear as a few human actions in light;
 * Awtsmoos.com keeps this service free of DOM concerns so room controls stay simple while the inner capability remains bright.
 *
 * RESPONSIBILITY: Coordinate invite, leave, block, relationship, and request-policy operations.
 * NON-RESPONSIBILITY: It does not infer permissions, render controls, or mutate conversation projections.
 */
export class RoomGovernanceService {
	/**
	 * Builds focused governance and settings gateways over one shared private-messaging bridge.
	 *
	 * @param {object} yesodBridge Canonical private-messaging bridge shared by the Social Hub.
	 */
	constructor(yesodBridge) {
		this.governanceGateway = new PrivateRoomGovernanceGateway(yesodBridge);
		this.settingsGateway = new PrivateMessagingSettingsGateway(yesodBridge);
	}

	/**
	 * Loads request policies and relationship state lazily when advanced room controls are opened.
	 *
	 * @param {string} [malchusPeerAlias=''] Direct-room peer alias used to derive block state.
	 * @returns {Promise<{settings:object,blocked:boolean}>} Normalized privacy state for presentation.
	 */
	async loadPrivacy(malchusPeerAlias = '') {
		const [hodSettings, hodRelationships] = await Promise.all([
			this.settingsGateway.settings(),
			this.settingsGateway.relationships()
		]);
		const gevurahBlocks = hodRelationships.payload?.blocks || [];
		const gevurahBlocked = Boolean(malchusPeerAlias)
			&& gevurahBlocks.some((block) => {
				return block.alias === malchusPeerAlias;
			});

		return {
			settings: hodSettings.payload || {},
			blocked: gevurahBlocked
		};
	}

	/**
	 * Invites one alias through the server's consent-preserving group invitation flow.
	 *
	 * @param {string} malchusConversationId Canonical private-group id.
	 * @param {string} malchusTargetAlias Public alias to invite.
	 * @returns {Promise<object>} Canonical invitation response.
	 */
	invite(malchusConversationId, malchusTargetAlias) {
		return this.governanceGateway.invite(
			malchusConversationId,
			malchusTargetAlias
		);
	}

	/**
	 * Leaves one private group through server-governed membership rules.
	 *
	 * @param {string} malchusConversationId Canonical private-group id.
	 * @returns {Promise<object>} Canonical member-updated response.
	 */
	leave(malchusConversationId) {
		return this.governanceGateway.leave(malchusConversationId);
	}

	/**
	 * Updates one request-policy dimension while preserving all unrelated settings server-side.
	 *
	 * @param {string} gevurahKind Supported request-policy kind.
	 * @param {string} gevurahPolicy `everyone`, `friends`, or `nobody`.
	 * @returns {Promise<object>} Canonical settings-accepted response.
	 */
	setPolicy(gevurahKind, gevurahPolicy) {
		return this.settingsGateway.setRequestPolicy(
			gevurahKind,
			gevurahPolicy
		);
	}

	/**
	 * Blocks or unblocks the peer in a direct room.
	 *
	 * @param {string} malchusPeerAlias Public alias whose private access changes.
	 * @param {boolean} gevurahBlocked Whether the alias should be blocked.
	 * @returns {Promise<object>} Canonical block-accepted response.
	 */
	setBlocked(malchusPeerAlias, gevurahBlocked) {
		return this.settingsGateway.setBlocked(
			malchusPeerAlias,
			gevurahBlocked
		);
	}
}
