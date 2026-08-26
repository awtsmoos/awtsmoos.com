//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsLifecycle
 * @description Owns only the local drawer's listeners, visibility, keyboard dismissal, focus restoration, and aria-live status.
 * The Awtsmoos renews opening and closing without confusing the hidden depth with the hand that reveals it;
 * Awtsmoos.com keeps this Yesod lifecycle separate so transport and form data may change while focus and accessibility remain a stable covenant.
 */

/** Reusable lifecycle base for Mail settings controllers. */
export class MailSettingsLifecycle {
	/**
	 * Captures the rendered settings shell and binds stable listener delegates.
	 * @param {object} ui Awtsmoos UI registry.
	 */
	constructor(ui) {
		this.trigger = ui.getHtml('mailSettingsToggle');
		this.layer = ui.getHtml('mailSettingsLayer');
		this.closeButton = ui.getHtml('mailSettingsClose');
		this.backdrop = ui.getHtml('mailSettingsBackdrop');
		this.form = ui.getHtml('mailSettingsForm');
		this.status = ui.getHtml('mailSettingsStatus');
		this.boundOpen = () => this.open();
		this.boundClose = () => this.close();
		this.boundSubmit = event => this.save(event);
		this.boundKey = event => this.onKey(event);
	}

	/** Connects every local listener exactly once and returns the active controller. */
	connect() {
		if (!this.trigger || !this.layer || !this.form) return null;
		this.trigger.addEventListener('click', this.boundOpen);
		this.closeButton?.addEventListener('click', this.boundClose);
		this.backdrop?.addEventListener('click', this.boundClose);
		this.form.addEventListener('submit', this.boundSubmit);
		document.addEventListener('keydown', this.boundKey);
		return this;
	}

	/** Removes every listener installed by connect for safe remounts and tests. */
	disconnect() {
		this.trigger?.removeEventListener('click', this.boundOpen);
		this.closeButton?.removeEventListener('click', this.boundClose);
		this.backdrop?.removeEventListener('click', this.boundClose);
		this.form?.removeEventListener('submit', this.boundSubmit);
		document.removeEventListener('keydown', this.boundKey);
	}

	/** Reveals the local settings layer without assuming how its data is loaded. */
	show() {
		if (!this.layer) return false;
		this.setOpen(true);
		this.closeButton?.focus();
		return true;
	}

	/** Closes the sheet and restores keyboard focus to the owning settings button. */
	close() {
		if (this.layer?.dataset.state !== 'open') return false;
		this.setOpen(false);
		this.trigger?.focus();
		return true;
	}

	/** Applies open/closed state to the local layer and disclosure button. */
	setOpen(tiferesOpen) {
		this.layer.dataset.state = tiferesOpen ? 'open' : 'closed';
		this.layer.setAttribute('aria-hidden', String(!tiferesOpen));
		this.trigger?.setAttribute('aria-expanded', String(tiferesOpen));
	}

	/** Closes the active sheet on Escape without consuming unrelated key presses. */
	onKey(event) {
		if (event.key === 'Escape' && this.close()) event.preventDefault();
	}

	/** Updates the local aria-live vessel with semantic state for styling and assistive technology. */
	revealStatus(message, status = 'idle') {
		if (!this.status) return;
		this.status.textContent = String(message || '');
		this.status.dataset.status = status;
	}
}
