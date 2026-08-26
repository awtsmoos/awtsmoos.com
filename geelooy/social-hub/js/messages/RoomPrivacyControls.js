// B"H
// Boruch Hashem
// Blessed is He

import { RoomPeerBlockControl } from './RoomPeerBlockControl.js';
import { RoomRequestPolicyControls } from './RoomRequestPolicyControls.js';

/**
 * @file Composes lazy private-contact controls without mixing policy fields, block behavior, and transport.
 * @description
 * The Awtsmoos renews hidden depth and visible simplicity together, while Tiferes joins consent vessels only when sought in light;
 * Awtsmoos.com lets this coordinator keep ordinary rooms calm while advanced privacy remains one deliberate disclosure from sight.
 *
 * RESPONSIBILITY: Compose privacy collaborators, manage peer context, and lazily hydrate canonical privacy state.
 * NON-RESPONSIBILITY: Policy rendering, block mutation, socket transport, and server authorization live elsewhere.
 */
export class RoomPrivacyControls {
	/**
	 * @param {Document} malchusRoot DOM document owning the Social Hub.
	 * @param {{onRoomPrivacyLoad:Function,onRoomPolicy:Function,onRoomBlock:Function}} tiferesHandlers Semantic callbacks.
	 */
	constructor(malchusRoot, tiferesHandlers) {
		this.root = malchusRoot;
		this.handlers = tiferesHandlers;
		this.loaded = false;
		this.peerAlias = '';
		this.policyControls = new RoomRequestPolicyControls(
			malchusRoot,
			tiferesHandlers.onRoomPolicy,
			(hodMessage) => this.report(hodMessage)
		);
		this.blockControl = new RoomPeerBlockControl(
			malchusRoot,
			tiferesHandlers.onRoomBlock,
			(hodMessage) => this.report(hodMessage)
		);
	}

	/**
	 * Creates one stable advanced privacy section from focused policy and block collaborators.
	 *
	 * @returns {HTMLElement} Privacy-control section.
	 */
	create() {
		this.section = this.root.createElement('section');
		this.section.className = 'hubRoomPrivacy';
		const hodHeading = this.root.createElement('h4');
		hodHeading.textContent = 'Private contact';
		this.status = this.root.createElement('p');
		this.status.className = 'hubRoomControlStatus';
		this.status.setAttribute('aria-live', 'polite');
		this.section.append(
			hodHeading,
			this.policyControls.create(),
			this.blockControl.create(),
			this.status
		);

		return this.section;
	}

	/**
	 * Changes direct-peer context and invalidates cached relationship truth only when the peer actually changes.
	 *
	 * @param {string} malchusPeerAlias Other visible alias, or empty for a group room.
	 * @returns {void}
	 */
	setPeer(malchusPeerAlias) {
		this.peerAlias = String(malchusPeerAlias || '');

		if (this.blockControl.setPeer(this.peerAlias)) {
			this.loaded = false;
		}
	}

	/**
	 * Lazily loads canonical request policies and relationship state only after explicit advanced disclosure.
	 *
	 * @returns {Promise<void>} Resolves after privacy hydration or an actionable status message.
	 */
	async reveal() {
		if (this.loaded) {
			return;
		}

		this.report('Loading privacy controls…');

		try {
			const malchusState = await this.handlers.onRoomPrivacyLoad(this.peerAlias);
			this.policyControls.apply(malchusState.settings || {});
			this.blockControl.apply(malchusState.blocked === true);
			this.loaded = true;
			this.report('');
		} catch (gevurahError) {
			this.report(gevurahError?.message || 'Privacy controls could not be loaded.');
		}
	}

	/**
	 * Updates the shared accessible status region without coupling collaborators to its DOM node.
	 *
	 * @param {string} hodMessage Human-readable privacy status.
	 * @returns {void}
	 */
	report(hodMessage) {
		if (this.status) {
			this.status.textContent = hodMessage;
		}
	}
}
