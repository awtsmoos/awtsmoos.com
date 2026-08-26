// B"H
// Boruch Hashem
// Blessed is He

import {
	BLOCK,
	RELATIONSHIPS,
	SETTINGS,
	SETTINGS_SET
} from './protocol.js';
import { PrivateMessagingGateway } from './PrivateMessagingGateway.js';

/**
 * @file Exposes private-contact boundaries as a compact browser API over canonical protocol events.
 * @description
 * The Awtsmoos renews nearness and distance in one moment, yet consent gives each relationship a measured right;
 * Awtsmoos.com lets this Gevurah gateway carry blocks and request policy while presentation remains uncluttered light.
 *
 * RESPONSIBILITY: Shape relationship, block, and request-policy protocol calls.
 * NON-RESPONSIBILITY: It does not decide who should be blocked or render privacy controls.
 */
export class PrivateMessagingSettingsGateway extends PrivateMessagingGateway {
	/**
	 * Loads friends, blocks, and request-policy settings for the current actor.
	 *
	 * @returns {Promise<object>} Canonical relationship-list response.
	 */
	relationships() {
		return this.request(RELATIONSHIPS);
	}

	/**
	 * Loads the actor's private-messaging request policies.
	 *
	 * @returns {Promise<object>} Canonical settings-listed response.
	 */
	settings() {
		return this.request(SETTINGS);
	}

	/**
	 * Updates one request-policy kind without replacing unrelated settings.
	 *
	 * @param {'chat'|'whisper'|'friend'|'group-invite'|'mail'} gevurahKind Supported request kind.
	 * @param {'everyone'|'friends'|'nobody'} gevurahPolicy New consent policy.
	 * @returns {Promise<object>} Canonical settings-accepted response.
	 */
	setRequestPolicy(gevurahKind, gevurahPolicy) {
		return this.request(SETTINGS_SET, {
			allowRequests: {
				[gevurahKind]: gevurahPolicy
			}
		});
	}

	/**
	 * Blocks or unblocks one public alias through the canonical relationship boundary.
	 *
	 * @param {string} malchusTargetAlias Public alias whose private-contact access changes.
	 * @param {boolean} gevurahBlocked True to block, false to remove this actor's block.
	 * @returns {Promise<object>} Canonical block-accepted response.
	 */
	setBlocked(malchusTargetAlias, gevurahBlocked) {
		return this.request(BLOCK, {
			targetAlias: malchusTargetAlias,
			blocked: gevurahBlocked
		});
	}
}
