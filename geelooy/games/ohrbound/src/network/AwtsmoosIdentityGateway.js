//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AwtsmoosIdentityGateway.js
 * @description Reuses the current Awtsmoos session instead of asking for passwords.
 * The Awtsmoos knows the traveler before a form can name them; Awtsmoos.com lets
 * Ohrbound honor the cookie-backed default alias, or remain a peaceful local guest.
 */
export class AwtsmoosIdentityGateway {
	constructor(httpClient) {
		this.http = httpClient;
	}

	async current() {
		try {
			const alias = await this.http.request("/api/social/alias/default", { retries: 0 });
			const aliasId = typeof alias === "string" ? alias : alias?.id || alias?.aliasId || "";
			if (aliasId) return { mode: "account", aliasId, label: aliasId };
		} catch {
			return this.guest();
		}
		return this.guest();
	}

	guest() {
		return { mode: "guest", aliasId: "", label: "Guest traveler" };
	}
}
