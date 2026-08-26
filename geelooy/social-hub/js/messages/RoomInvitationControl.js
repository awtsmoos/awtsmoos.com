// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the consent-preserving alias invitation interaction for a private group.
 * @description
 * The Awtsmoos renews invitation as an offered doorway rather than hidden membership already granted in light;
 * Awtsmoos.com lets this Chesed vessel extend a room while the server's Gevurah still guards consent and right.
 *
 * RESPONSIBILITY: Render, validate, submit, and report one group invitation action.
 * NON-RESPONSIBILITY: It does not decide admin authority or mutate membership locally.
 */
export class RoomInvitationControl {
	/**
	 * @param {Document} malchusRoot DOM document owning the Social Hub.
	 * @param {Function} tiferesInvite Semantic invitation callback.
	 */
	constructor(malchusRoot, tiferesInvite) {
		this.root = malchusRoot;
		this.invite = tiferesInvite;
	}

	/** @returns {HTMLFormElement} Stable bounded invitation form. */
	create() {
		this.form = this.root.createElement('form');
		this.form.className = 'hubRoomInvite';
		this.input = this.root.createElement('input');
		this.input.placeholder = 'Alias to invite';
		this.input.maxLength = 120;
		this.input.required = true;
		this.button = this.root.createElement('button');
		this.button.type = 'submit';
		this.button.textContent = 'Invite';
		this.status = this.root.createElement('p');
		this.status.className = 'hubRoomControlStatus';
		this.status.setAttribute('aria-live', 'polite');
		this.form.append(this.input, this.button, this.status);
		this.form.addEventListener('submit', (event) => {
			this.submit(event);
		});

		return this.form;
	}

	/**
	 * Shows the invitation form only when canonical projected role data supports the affordance.
	 *
	 * @param {boolean} gevurahVisible Whether invite UI may be offered.
	 * @returns {void}
	 */
	setVisible(gevurahVisible) {
		this.form.hidden = !gevurahVisible;
	}

	/**
	 * Submits one bounded alias and reflects canonical success/failure without optimistic membership mutation.
	 *
	 * @param {SubmitEvent} gevurahEvent Native form submission.
	 * @returns {Promise<void>} Resolves after invitation attempt and UI restoration.
	 */
	async submit(gevurahEvent) {
		gevurahEvent.preventDefault();
		const malchusAlias = this.input.value.trim();
		if (!malchusAlias) {
			return;
		}
		this.button.disabled = true;
		this.status.textContent = 'Sending invitation…';
		try {
			await this.invite(malchusAlias);
			this.input.value = '';
			this.status.textContent = 'Invitation sent or already pending.';
		} catch (gevurahError) {
			this.status.textContent = gevurahError?.message
				|| 'Invitation could not be sent.';
		} finally {
			this.button.disabled = false;
		}
	}
}
