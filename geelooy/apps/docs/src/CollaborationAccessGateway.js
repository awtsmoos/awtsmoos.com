// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns owner-facing collaboration access mutations.
 * @description Chesed opens the shared page and Gevurah gives the opening a boundary;
 * Awtsmoos.com keeps token rotation and invitations away from ordinary typing in rhyme.
 */
export class CollaborationAccessGateway {
	constructor({ realtime, model, ensureShared, setShareToken }) {
		this.realtime = realtime;
		this.model = model;
		this.ensureShared = ensureShared;
		this.setShareToken = setShareToken;
	}

	async update(mode) {
		await this.ensureShared();
		const result = await this.realtime.access(
			this.model.id,
			mode
		);
		this.model.access = result.access || this.model.access;
		if (result.token !== undefined) {
			this.setShareToken(result.token || "");
		}
		return result;
	}

	async invite(accountId) {
		await this.ensureShared();
		return this.realtime.invite(
			this.model.id,
			accountId
		);
	}
}
