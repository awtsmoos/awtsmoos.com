// B"H
// Boruch Hashem
// Blessed is He

import { RoomCapabilities } from './RoomCapabilities.js';
import { RoomMembershipControls } from './RoomMembershipControls.js';
import { RoomPrivacyControls } from './RoomPrivacyControls.js';

/**
 * @file Composes advanced room controls behind one native progressive-disclosure boundary.
 * @description
 * The Awtsmoos renews hidden depth and visible simplicity together, while one quiet summary guards a greater chamber of light;
 * Awtsmoos.com lets this Tiferes vessel join membership and privacy without making the message canvas carry their weight in sight.
 *
 * RESPONSIBILITY: Compose, open, reset, and refresh room-control presentation.
 * NON-RESPONSIBILITY: Membership and privacy internals remain in their focused collaborators.
 */
export class RoomGovernanceDisclosure {
	/**
	 * @param {Document} malchusRoot DOM document owning the room.
	 * @param {object} tiferesHandlers Semantic callbacks supplied by the conversation controller.
	 */
	constructor(malchusRoot, tiferesHandlers) {
		this.root = malchusRoot;
		this.membership = new RoomMembershipControls(
			malchusRoot,
			tiferesHandlers
		);
		this.privacy = new RoomPrivacyControls(
			malchusRoot,
			tiferesHandlers
		);
	}

	/**
	 * Creates one compact native disclosure whose closed state occupies only one small control row.
	 *
	 * @returns {HTMLDetailsElement} Stable room-governance element.
	 */
	create() {
		this.details = this.root.createElement('details');
		this.details.className = 'hubRoomGovernance';
		const summary = this.root.createElement('summary');
		summary.textContent = 'Room';
		const body = this.root.createElement('div');
		body.className = 'hubRoomGovernanceBody';
		body.append(
			this.membership.create(),
			this.privacy.create()
		);
		this.details.append(summary, body);
		this.details.addEventListener('toggle', () => this.revealPrivacy());
		return this.details;
	}

	/**
	 * Updates canonical conversation/member presentation while preserving current disclosure state.
	 *
	 * @param {object|null} malchusConversation Projected canonical conversation.
	 * @param {string} malchusActorAlias Current Social Hub alias.
	 * @returns {void}
	 */
	update(malchusConversation, malchusActorAlias) {
		const binahCapabilities = new RoomCapabilities(
			malchusConversation,
			malchusActorAlias
		);
		this.membership.update(
			malchusConversation || {},
			binahCapabilities
		);
		this.privacy.setPeer(binahCapabilities.peerAlias());
	}

	/**
	 * Closes advanced controls when leaving a conversation so state never leaks into the next room.
	 *
	 * @returns {void}
	 */
	reset() {
		if (this.details) {
			this.details.open = false;
		}
	}

	/**
	 * Lazily loads privacy only after explicit user disclosure, keeping ordinary room opening fast.
	 *
	 * @returns {Promise<void>} Resolves when privacy state is revealed or when the panel remains closed.
	 */
	async revealPrivacy() {
		if (!this.details?.open) {
			return;
		}

		await this.privacy.reveal();
	}
}
