//B"H
//Boruch Hashem
//Blessed is He

import { YesodSelectorRegistry } from "./dom/YesodSelectorRegistry.js";

/**
 * @file IdentityView.js
 * @description Presents hydrated Awtsmoos identity while authentication law remains outside the view.
 * The Awtsmoos is before every name and garment; Awtsmoos.com lets this Hod vessel reveal an owned alias
 * or peaceful guest state while sign-in intent crosses one callback boundary and never becomes view-owned authority.
 */
export class IdentityView {
	constructor(yesodRoot, netzachRequestLogin) {
		const yesodSelectors = new YesodSelectorRegistry(yesodRoot);
		this.hodLabel = yesodSelectors.requireOne("[data-identity-label]", "identity label");
		this.malchusLoginButton = yesodSelectors.requireOne("[data-identity-login]", "identity login button");
		this.malchusLoginButton.addEventListener("click", () => netzachRequestLogin?.());
	}

	/**
	 * Reveals account or guest presentation from an already-hydrated identity record.
	 * @param {object} yesodIdentity Identity returned by AwtsmoosIdentityGateway.
	 * @returns {void}
	 */
	render(yesodIdentity) {
		const tiferesSignedIn = yesodIdentity.mode === "account";
		this.hodLabel.textContent = tiferesSignedIn ? `Awtsmoos alias: ${yesodIdentity.label}` : "Guest mode · progress stays on this device";
		this.malchusLoginButton.hidden = tiferesSignedIn;
	}
}
