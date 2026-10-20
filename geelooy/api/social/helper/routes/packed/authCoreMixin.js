//B"H
//Blessed is He
//Boruch Hashem

/** @module AuthCoreMixin
 * Authorization for PackedPostImportRoutes: Ed25519 signature first,
 * OAuth operator identity (asdf) second, operator key last. Fail closed:
 * any doubt returns an error object, never silent access.
 */

const crypto = require('crypto');
const { requestValue } = require('./requestValues.js');

module.exports = {

	// -- authorization -------------------------------------------------------
	// Signature-first, operator-key fallback. Ed25519 signature auth (see
	// importSign.js) survives production restarts; the operator-key env var
	// (AWTSMOOS_IMPORT_KEY) is transient and may be unset. Fail closed.
	checkAuth() {
		const sigResult = this.checkSignatureAuth();
		if (sigResult === null) return null; // valid signature
		if (sigResult !== 'NO_ATTEMPT') return sigResult; // bad signature: fail closed
		// OAuth operator identity (asdf): the operator's own authenticated
		// requests need neither an Ed25519 signature nor the operator key.
		if (this.isOAuthOperator()) return null;
		// No signature fields: try the operator key.
		const expected = process.env.AWTSMOOS_IMPORT_KEY;
		if (!expected) {
			return { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Post import is not configured on this server (no operator key and no valid signature).' };
		}
		const given = requestValue(this.$i, 'operatorKey') || this.$i?.body?.operatorKey || '';
		if (!given) return { success: false, error: 'FORBIDDEN', message: 'operatorKey is required.' };
		const a = Buffer.from(String(given));
		const b = Buffer.from(String(expected));
		if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
			return { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' };
		}
		return null;
	},


	// -- OAuth operator authorization -----------------------------------------
	// Accepts the operator's own OAuth identity (userId/accountId 'asdf')
	// as sufficient authority for import. Fail-closed: anything else falls
	// through to the operator-key check above.
	isOAuthOperator() {
		try {
			const { readBearer } = require('../../../../oauth/core/tokenReader.js');
			const resolved = readBearer(this.$i);
			if (!resolved || !resolved.ok) return false;
			const entry = resolved.entry || {};
			return String(entry.userId || '') === 'asdf' && String(entry.accountId || entry.userId || '') === 'asdf';
		} catch (_) {
			return false;
		}
	}
};
