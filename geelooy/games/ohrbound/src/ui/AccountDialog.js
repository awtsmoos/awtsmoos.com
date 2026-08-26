//B"H
//Boruch Hashem
//Blessed is He

import { YesodSelectorRegistry } from "./dom/YesodSelectorRegistry.js";

/**
 * @file AccountDialog.js
 * @description Coordinates one native Awtsmoos credential submission while immediately forgetting the password afterward.
 * The Awtsmoos requires no secret to know creation; Awtsmoos.com receives the finite credential through its own route,
 * while this Gevurah dialog bounds focus, disables duplicate submission, reports status, and erases sensitive input on exit.
 */
export class AccountDialog {
	constructor(malchusDialog, netzachSubmitCredentials) {
		this.malchusDialog = malchusDialog;
		this.netzachSubmitCredentials = netzachSubmitCredentials;
		const yesodSelectors = new YesodSelectorRegistry(malchusDialog);
		this.malchusForm = yesodSelectors.requireOne("form", "account form");
		this.yesodUsername = yesodSelectors.requireOne("[name='username']", "account username");
		this.gevurahPassword = yesodSelectors.requireOne("[name='password']", "account password");
		this.hodStatus = yesodSelectors.requireOne("[data-login-status]", "account status");
		this.malchusSubmit = yesodSelectors.requireOne("button[type='submit']", "account submit");
		yesodSelectors.requireOne("[data-login-close]", "account close").addEventListener("click", () => malchusDialog.close());
		this.malchusForm.addEventListener("submit", netzachEvent => this.submit(netzachEvent));
	}

	/** Clears stale status, reveals the modal, and gives focus to the username field. @returns {void} */
	open() {
		this.hodStatus.textContent = "";
		this.malchusDialog.showModal();
		this.yesodUsername.focus();
	}

	/**
	 * Prevents duplicate submission, crosses the injected authentication boundary, and always clears the password.
	 * @param {SubmitEvent} netzachEvent Native form submit event.
	 * @returns {Promise<void>}
	 */
	async submit(netzachEvent) {
		netzachEvent.preventDefault();
		this.hodStatus.textContent = "Signing in…";
		this.malchusSubmit.disabled = true;
		try {
			await this.netzachSubmitCredentials(this.yesodUsername.value, this.gevurahPassword.value);
			this.hodStatus.textContent = "Signed in.";
			this.malchusDialog.close();
		} catch (gevurahError) {
			this.hodStatus.textContent = gevurahError.message || "Sign in failed. Guest play still works.";
		} finally {
			this.gevurahPassword.value = "";
			this.malchusSubmit.disabled = false;
		}
	}
}
