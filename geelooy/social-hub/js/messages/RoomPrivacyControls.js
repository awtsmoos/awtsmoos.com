// B"H
// Boruch Hashem
// Blessed is He

const GEVURAH_POLICIES = Object.freeze([
	['everyone', 'Everyone'],
	['friends', 'Friends'],
	['nobody', 'Nobody']
]);
const GEVURAH_KINDS = Object.freeze([
	['chat', 'New chats'],
	['group-invite', 'Group invites'],
	['mail', 'Mail']
]);

/**
 * @file Renders private-contact request policy and direct-peer block state inside advanced room controls.
 * @description
 * The Awtsmoos renews openness and restraint together, while consent gives every incoming path its fitting right;
 * Awtsmoos.com lets this Gevurah vessel reveal three clear choices without flooding the conversation with settings in sight.
 *
 * RESPONSIBILITY: Privacy-control presentation, lazy loading, and semantic callback dispatch.
 * NON-RESPONSIBILITY: It does not persist settings or infer server authorization.
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
	}

	/**
	 * Creates the persistent privacy section and its bounded policy controls.
	 *
	 * @returns {HTMLElement} Privacy-control section.
	 */
	create() {
		this.section = this.root.createElement('section');
		this.section.className = 'hubRoomPrivacy';
		const heading = this.root.createElement('h4');
		heading.textContent = 'Private contact';
		this.policyGrid = this.root.createElement('div');
		this.policyGrid.className = 'hubRoomPolicyGrid';
		this.selects = new Map();

		for (const [kind, label] of GEVURAH_KINDS) {
			this.policyGrid.append(this.buildPolicy(kind, label));
		}

		this.blockButton = this.root.createElement('button');
		this.blockButton.type = 'button';
		this.blockButton.className = 'hubRoomBlockButton';
		this.blockButton.hidden = true;
		this.blockButton.addEventListener('click', () => this.toggleBlock());
		this.status = this.root.createElement('p');
		this.status.className = 'hubRoomControlStatus';
		this.status.setAttribute('aria-live', 'polite');
		this.section.append(heading, this.policyGrid, this.blockButton, this.status);
		return this.section;
	}

	/**
	 * Changes the direct-room peer context and invalidates lazily loaded block state when the room changes.
	 *
	 * @param {string} malchusPeerAlias Other visible alias for a direct room, or empty for a group.
	 * @returns {void}
	 */
	setPeer(malchusPeerAlias) {
		const nextAlias = String(malchusPeerAlias || '');
		if (nextAlias !== this.peerAlias) {
			this.loaded = false;
		}

		this.peerAlias = nextAlias;
		this.blockButton.hidden = !this.peerAlias;
	}

	/**
	 * Loads request policies and block state only when the user opens advanced room controls.
	 *
	 * @returns {Promise<void>} Resolves after canonical privacy state is rendered.
	 */
	async reveal() {
		if (this.loaded) {
			return;
		}

		this.status.textContent = 'Loading privacy controls…';
		try {
			const state = await this.handlers.onRoomPrivacyLoad(this.peerAlias);
			this.applySettings(state.settings || {});
			this.blocked = state.blocked === true;
			this.renderBlock();
			this.loaded = true;
			this.status.textContent = '';
		} catch (error) {
			this.status.textContent = error?.message || 'Privacy controls could not be loaded.';
		}
	}

	/**
	 * Creates one policy select from the server-supported request-policy vocabulary.
	 *
	 * @param {string} gevurahKind Canonical request-policy key.
	 * @param {string} hodLabel Human-readable field label.
	 * @returns {HTMLLabelElement} Complete labeled policy control.
	 */
	buildPolicy(gevurahKind, hodLabel) {
		const label = this.root.createElement('label');
		const text = this.root.createElement('span');
		text.textContent = hodLabel;
		const select = this.root.createElement('select');

		for (const [value, caption] of GEVURAH_POLICIES) {
			const option = this.root.createElement('option');
			option.value = value;
			option.textContent = caption;
			select.append(option);
		}

		select.addEventListener('change', () => this.changePolicy(gevurahKind, select));
		this.selects.set(gevurahKind, select);
		label.append(text, select);
		return label;
	}

	/** @param {object} settings @returns {void} Applies canonical request policies to visible selects. */
	applySettings(settings) {
		const policies = settings.allowRequests || {};
		for (const [kind, select] of this.selects.entries()) {
			select.value = policies[kind] || 'nobody';
		}
	}

	/** @param {string} kind @param {HTMLSelectElement} select @returns {Promise<void>} Persists one policy. */
	async changePolicy(kind, select) {
		select.disabled = true;
		this.status.textContent = 'Saving privacy…';
		try {
			await this.handlers.onRoomPolicy(kind, select.value);
			this.status.textContent = 'Privacy updated.';
		} catch (error) {
			this.status.textContent = error?.message || 'Privacy could not be updated.';
		} finally {
			select.disabled = false;
		}
	}

	/** @returns {Promise<void>} Toggles the current direct-peer block through a semantic callback. */
	async toggleBlock() {
		if (!this.peerAlias) return;
		this.blockButton.disabled = true;
		try {
			await this.handlers.onRoomBlock(this.peerAlias, !this.blocked);
			this.blocked = !this.blocked;
			this.renderBlock();
			this.status.textContent = this.blocked ? 'Alias blocked.' : 'Alias unblocked.';
		} catch (error) {
			this.status.textContent = error?.message || 'Block setting could not be changed.';
		} finally {
			this.blockButton.disabled = false;
		}
	}

	/** @returns {void} Renders the direct-peer block action from canonical local state. */
	renderBlock() {
		this.blockButton.textContent = this.blocked
			? `Unblock ${this.peerAlias}`
			: `Block ${this.peerAlias}`;
	}
}
