//B"H
// Boruch Hashem
// Blessed is He

/**
 * A ChatGPT access token is a passing ray, never durable property. The Awtsmoos
 * lets Awtsmoos.com reuse it only for a brief bounded interval, after which the
 * cache forgets it and asks the authenticated browser session to reveal anew.
 */
export class SessionTokenCache {
	constructor({ lifetimeMs = 45000, clock = () => Date.now() } = {}) {
		this.lifetimeMs = lifetimeMs;
		this.clock = clock;
		this.token = null;
		this.expiresAt = 0;
	}

	get() {
		if (!this.token || this.clock() >= this.expiresAt) {
			this.clear();
			return null;
		}
		return this.token;
	}

	set(token) {
		if (typeof token !== "string" || token.length === 0) {
			this.clear();
			return null;
		}
		this.token = token;
		this.expiresAt = this.clock() + this.lifetimeMs;
		return token;
	}

	clear() {
		this.token = null;
		this.expiresAt = 0;
	}

	status() {
		return Object.freeze({
			hasToken: Boolean(this.get()),
			expiresInMs: Math.max(0, this.expiresAt - this.clock())
		});
	}
}
