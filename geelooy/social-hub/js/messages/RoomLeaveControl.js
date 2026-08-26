// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns deliberate voluntary departure from one accepted private group.
 * @description
 * The Awtsmoos renews presence and departure without making either state independently stand in light;
 * Awtsmoos.com lets this Gevurah vessel require explicit disclosure before leaving, while the server guards ownership right.
 *
 * RESPONSIBILITY: Render leave constraints, explicit confirmation, busy state, and semantic departure callback.
 * NON-RESPONSIBILITY: It does not infer server permission, transfer ownership, or mutate room membership locally.
 */
export class RoomLeaveControl {
	/**
	 * @param {Document} malchusRoot DOM document owning the Social Hub.
	 * @param {Function} tiferesLeave Semantic callback that performs canonical group departure.
	 */
	constructor(malchusRoot, tiferesLeave) {
		this.root = malchusRoot;
		this.leave = tiferesLeave;
	}

	/**
	 * Creates one nested native disclosure so destructive departure never occupies ordinary room attention.
	 *
	 * @returns {HTMLDetailsElement} Stable leave-control disclosure.
	 */
	create() {
		this.details = this.root.createElement('details');
		this.details.className = 'hubRoomLeave';
		const summary = this.root.createElement('summary');
		summary.textContent = 'Leave group';
		this.note = this.root.createElement('p');
		this.button = this.root.createElement('button');
		this.button.type = 'button';
		this.button.textContent = 'Confirm leave';
		this.status = this.root.createElement('p');
		this.status.className = 'hubRoomControlStatus';
		this.status.setAttribute('aria-live', 'polite');
		this.button.addEventListener('click', () => {
			this.submit();
		});
		this.details.append(summary, this.note, this.button, this.status);

		return this.details;
	}

	/**
	 * Reflects capability truth without pretending the browser owns authorization.
	 *
	 * @param {boolean} gevurahVisible Whether this is a private group.
	 * @param {boolean} gevurahEnabled Whether projected role data permits a simple leave attempt.
	 * @param {string} hodConstraint Human explanation when departure requires ownership transfer first.
	 * @returns {void}
	 */
	update(gevurahVisible, gevurahEnabled, hodConstraint) {
		this.details.hidden = !gevurahVisible;
		this.button.disabled = !gevurahEnabled;
		this.note.textContent = hodConstraint || 'Leave this private group.';
	}

	/**
	 * Performs canonical departure only after explicit confirmation and reports any server-policy rejection.
	 *
	 * @returns {Promise<void>} Resolves after accepted departure or after restoring the failed action state.
	 */
	async submit() {
		this.button.disabled = true;
		this.status.textContent = 'Leaving group…';
		try {
			await this.leave();
		} catch (gevurahError) {
			this.status.textContent = gevurahError?.message
				|| 'The group could not be left.';
			this.button.disabled = false;
		}
	}
}
