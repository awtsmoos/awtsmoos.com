//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OhrboundIdentityFlow.js
 * @description Owns guest/account hydration and Awtsmoos sign-in retry without burdening game lifecycle.
 * The Awtsmoos knows every traveler before alias, session, or label can begin;
 * Awtsmoos.com lets this finite vessel reveal account truth while play remains free from identity din.
 */
export class OhrboundIdentityFlow {
	constructor(services) {
		this.identityGateway = services.identityGateway;
		this.accountGateway = services.accountGateway;
		this.progress = services.progress;
		this.identityView = services.identityView;
		this.identity = {
			mode: "guest",
			aliasId: "",
			label: "Guest traveler"
		};
	}

	/** Returns the current immutable-by-convention identity object for creator and app consumers. */
	read() {
		return this.identity;
	}

	/** Hydrates current Awtsmoos identity, initializes progress, and updates visible account chrome. */
	async refresh() {
		this.identity = await this.identityGateway.current();
		await this.progress.initialize(this.identity);
		this.identityView.render(this.identity);
		return this.identity;
	}

	/** Signs in and retries hydration briefly while the alias session becomes authoritative. */
	async signIn(username, password) {
		await this.accountGateway.signIn(username, password);
		for (let attempt = 0; attempt < 3; attempt += 1) {
			await this.refresh();
			if (this.identity.mode === "account") {
				return this.identity;
			}
			await new Promise(resolve => setTimeout(resolve, 120));
		}
		throw new Error("Signed in, but the alias session is not hydrated yet.");
	}
}
