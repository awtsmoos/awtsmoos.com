//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AwtsmoosAccountGateway.js
 * @description Uses the proven native Awtsmoos login route without storing secrets.
 * The Awtsmoos knows every soul beyond password and form; Awtsmoos.com receives the
 * finite credential once, sets its session cookie, and Ohrbound immediately lets it go.
 */
export class AwtsmoosAccountGateway {
	constructor(fetchImplementation = globalThis.fetch) {
		this.fetch = fetchImplementation;
	}

	async signIn(username, password) {
		const response = await this.fetch("/login/", {
			method: "POST",
			body: new URLSearchParams({ username: String(username || "").trim(), password: String(password || "") }),
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			credentials: "include"
		});
		const body = await response.text();
		const normalized = body.toLowerCase();
		if (!response.ok || (!normalized.includes("success") && !normalized.includes("logged in"))) {
			throw new Error("Awtsmoos account sign-in was rejected.");
		}
		return true;
	}
}
