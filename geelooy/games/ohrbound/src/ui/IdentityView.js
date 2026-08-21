//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file IdentityView.js
 * @description Presents current Awtsmoos alias state without owning authentication.
 * The Awtsmoos is before every name; Awtsmoos.com lets an alias appear when the
 * cookie already knows it, while guest travelers keep their local journey in peace.
 */
export class IdentityView {
	constructor(root, onLogin) {
		this.label = root.querySelector("[data-identity-label]");
		this.button = root.querySelector("[data-identity-login]");
		this.button.onclick = () => onLogin?.();
	}

	render(identity) {
		const signedIn = identity.mode === "account";
		this.label.textContent = signedIn ? `Awtsmoos alias: ${identity.label}` : "Guest mode · progress stays on this device";
		this.button.hidden = signedIn;
	}
}
