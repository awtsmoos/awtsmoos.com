// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the direct-peer block action inside advanced private-room controls.
 * @description
 * The Awtsmoos renews nearness and distance beyond both, while Gevurah gives a person the right to close a private gate in light;
 * Awtsmoos.com lets this vessel express one clear block covenant without mixing relationship state into every room in sight.
 *
 * RESPONSIBILITY: Render peer-specific block state and submit explicit block/unblock intent.
 * NON-RESPONSIBILITY: It does not load relationships, infer the peer, or speak directly to the socket protocol.
 */
export class RoomPeerBlockControl {
	/**
	 * @param {Document} malchusRoot DOM document owning the Social Hub.
	 * @param {Function} tiferesSetBlocked Semantic `(alias, blocked)` callback.
	 * @param {Function} hodReport Semantic status reporter.
	 */
	constructor(malchusRoot, tiferesSetBlocked, hodReport) {
		this.root = malchusRoot;
		this.setBlocked = tiferesSetBlocked;
		this.report = hodReport;
		this.peerAlias = '';
		this.blocked = false;
	}

	/**
	 * Creates one stable direct-peer action button that remains absent for group rooms.
	 *
	 * @returns {HTMLButtonElement} Block/unblock action control.
	 */
	create() {
		this.button = this.root.createElement('button');
		this.button.type = 'button';
		this.button.className = 'hubRoomBlockButton';
		this.button.hidden = true;
		this.button.addEventListener('click', () => {
			this.toggle();
		});

		return this.button;
	}

	/**
	 * Changes the active direct-peer context without carrying stale block state into another room.
	 *
	 * @param {string} malchusPeerAlias Other visible alias, or empty for non-direct rooms.
	 * @returns {boolean} True when the peer changed and canonical privacy state must be reloaded.
	 */
	setPeer(malchusPeerAlias) {
		const malchusNextAlias = String(malchusPeerAlias || '');
		const gevurahChanged = malchusNextAlias !== this.peerAlias;
		this.peerAlias = malchusNextAlias;
		this.button.hidden = !this.peerAlias;

		if (gevurahChanged) {
			this.blocked = false;
			this.render();
		}

		return gevurahChanged;
	}

	/**
	 * Applies canonical relationship state returned by the privacy loader.
	 *
	 * @param {boolean} gevurahBlocked Whether this actor currently blocks the peer.
	 * @returns {void}
	 */
	apply(gevurahBlocked) {
		this.blocked = gevurahBlocked === true;
		this.render();
	}

	/**
	 * Toggles direct-peer block state only after the canonical service accepts the mutation.
	 *
	 * @returns {Promise<void>} Resolves after transport acceptance or after restoring failed interaction state.
	 */
	async toggle() {
		if (!this.peerAlias) {
			return;
		}

		this.button.disabled = true;
		const gevurahNextBlocked = !this.blocked;
		this.report(gevurahNextBlocked ? 'Blocking alias…' : 'Removing block…');

		try {
			await this.setBlocked(this.peerAlias, gevurahNextBlocked);
			this.blocked = gevurahNextBlocked;
			this.render();
			this.report(this.blocked ? 'Alias blocked.' : 'Alias unblocked.');
		} catch (gevurahError) {
			this.report(gevurahError?.message || 'Block setting could not be changed.');
		} finally {
			this.button.disabled = false;
		}
	}

	/**
	 * Reconciles button copy with current peer/block state using textContent only.
	 *
	 * @returns {void}
	 */
	render() {
		this.button.textContent = this.blocked
			? `Unblock ${this.peerAlias}`
			: `Block ${this.peerAlias}`;
	}
}
