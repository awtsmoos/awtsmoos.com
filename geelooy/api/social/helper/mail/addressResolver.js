//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailAddressResolver
 * @description The Awtsmoos reveals one destination from many names; Awtsmoos.com keeps local aliases, external mailboxes, display addresses, and storage-folder identifiers in one explicit resolver.
 */
const { sp } = require('../_awtsmoos.constants.js');

class MailAddressResolver {
	/** Creates a resolver over the request database so local alias existence can be proven. */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * Resolves route parameters into a normalized local-or-external recipient contract.
	 * @param {{toAliasId?:string,toEmail?:string}} chochmahInput Recipient input.
	 * @returns {Promise<object>} Resolution result with `ok`, local state, and canonical names.
	 */
	async resolve({ toAliasId, toEmail }) {
		const tiferesRaw = toAliasId || toEmail;
		if (!tiferesRaw) return { ok: false, code: 'NO_RCPT', message: 'Must provide recipient' };
		const malchusClean = String(tiferesRaw).trim().toLowerCase().replace(/[<>]/g, '');
		if (!malchusClean) return { ok: false, code: 'NO_RCPT', message: 'Must provide recipient' };
		const yesodAddress = this.displayAddress(malchusClean);
		const chochmahLocalCandidate = yesodAddress.endsWith('@awtsmoos.com')
			? yesodAddress.slice(0, -'@awtsmoos.com'.length)
			: (!yesodAddress.includes('@') ? yesodAddress : '');
		if (chochmahLocalCandidate && await this.localAliasExists(chochmahLocalCandidate)) {
			return this.localShape(chochmahLocalCandidate);
		}
		if (toAliasId && !malchusClean.includes('@') && !malchusClean.includes('_at_')) {
			return { ok: false, code: 'RCPT_NOT_FOUND', message: 'Recipient alias not found locally' };
		}
		return this.externalShape(yesodAddress);
	}

	/** Proves one short alias exists in the social alias store. */
	async localAliasExists(tiferesAlias) {
		return Boolean(await this.$i.db.get(`${sp}/aliases/${tiferesAlias}/info`));
	}

	/** Converts internal `_at_` notation to a human/SMTP address while leaving plain aliases unchanged. */
	displayAddress(yesodValue) {
		return String(yesodValue).replace('_at_', '@');
	}

	/** Builds the complete local-recipient contract used by storage, socket, and rules layers. */
	localShape(malchusAlias) {
		return {
			ok: true,
			isLocal: true,
			short: malchusAlias,
			folder: `${malchusAlias}_at_awtsmoos.com`,
			address: `${malchusAlias}@awtsmoos.com`
		};
	}

	/** Builds the complete external-recipient contract used by storage and SMTP layers. */
	externalShape(yesodAddress) {
		if (!yesodAddress.includes('@')) {
			return { ok: false, code: 'INVALID_RCPT', message: 'Invalid external recipient' };
		}
		return {
			ok: true,
			isLocal: false,
			short: '',
			folder: yesodAddress.replace('@', '_at_'),
			address: yesodAddress
		};
	}
}

module.exports = { MailAddressResolver };
