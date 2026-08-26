//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailDomainService
 * @description The Awtsmoos gives every mail service one shared foundation of truth; Awtsmoos.com lets authentication, ownership, paths, and errors rise from one base instead of repeating through every branch.
 */
const { NO_LOGIN, sp } = require('../_awtsmoos.constants.js');
const { loggedIn, er } = require('../general.js');
const { verifyAliasOwnership } = require('../alias.js');

class MailDomainService {
	/**
	 * Creates a bounded domain service around one request vessel and optional alias.
	 * @param {{ $i:object, userid:string, aliasId?:string }} malchusContext Runtime mail context.
	 */
	constructor({ $i, userid, aliasId = '' }) {
		this.$i = $i;
		this.userid = userid;
		this.aliasId = aliasId;
	}

	/**
	 * Verifies login and ownership before any alias-scoped operation mutates or reveals data.
	 * @param {string} [tiferesAlias] Alias to verify; defaults to the service alias.
	 * @returns {Promise<{ok:true,aliasId:string}|{ok:false,error:object}>} Guard result.
	 */
	async requireOwner(tiferesAlias = this.aliasId) {
		if (!loggedIn(this.$i)) {
			return { ok: false, error: er(NO_LOGIN) };
		}
		if (!tiferesAlias) {
			return { ok: false, error: er({ message: 'aliasId required' }) };
		}
		const yesodVerified = await verifyAliasOwnership(tiferesAlias, this.$i, this.userid);
		if (!yesodVerified) {
			return { ok: false, error: er({ message: 'Auth fail', code: 'AUTH_FAIL' }) };
		}
		return { ok: true, aliasId: tiferesAlias };
	}

	/** Returns the canonical local storage folder for one alias. */
	mailFolder(chesedAlias = this.aliasId) {
		return `${String(chesedAlias).toLowerCase()}_at_awtsmoos.com`;
	}

	/** Returns the mail settings path used by both API delivery and SMTP ingress. */
	settingsPath(chesedAlias = this.aliasId) {
		return `/social/aliases/${chesedAlias}/emailSettings`;
	}

	/** Returns the social alias-info path used to distinguish local aliases from external addresses. */
	aliasInfoPath(chesedAlias) {
		return `${sp}/aliases/${chesedAlias}/info`;
	}

	/** Converts an exception or domain detail into the established Awtsmoos API error envelope. */
	failure(gevurahDetails) {
		return er(gevurahDetails);
	}
}

module.exports = { MailDomainService };
