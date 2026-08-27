//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AccountDialog.js
 * @description Submits credentials once to native Awtsmoos login and clears password.
 * The Awtsmoos needs no secret to know creation; Awtsmoos.com accepts the finite
 * credential through its own route, while this dialog forgets the password immediately.
 */
export class AccountDialog {
	constructor(dialog, onSubmit) {
		this.dialog = dialog;
		this.form = dialog.querySelector("form");
		this.username = dialog.querySelector("[name='username']");
		this.password = dialog.querySelector("[name='password']");
		this.status = dialog.querySelector("[data-login-status]");
		dialog.querySelector("[data-login-close]").onclick = () => dialog.close();
		this.form.onsubmit = event => this.submit(event, onSubmit);
	}

	open() {
		this.status.textContent = "";
		this.dialog.showModal();
		this.username.focus();
	}

	async submit(event, onSubmit) {
		event.preventDefault();
		this.status.textContent = "Signing in…";
		this.form.querySelector("button[type='submit']").disabled = true;
		try {
			await onSubmit(this.username.value, this.password.value);
			this.status.textContent = "Signed in.";
			this.dialog.close();
		} catch (error) {
			this.status.textContent = error.message || "Sign in failed. Guest play still works.";
		} finally {
			this.password.value = "";
			this.form.querySelector("button[type='submit']").disabled = false;
		}
	}
}
