//B"H
//Blessed is He
//Boruch Hashem

/** @module AuthCoreMixin
 * Authorization for PackedPostImportRoutes: Ed25519 signature first,
 * OAuth operator identity (asdf) second, operator key last. Fail closed:
 * any doubt returns an error object, never silent access.
 *
 * Multi-user generalization (2026-10-21): checkAuthDetailed() also
 * authenticates ANY Awtsmoos OAuth bearer (see ownership.js) — an agent
 * acts AS its authorizing user. Only the routes that enforce per-target
 * ownership (posts/update, posts/start, census) use the detailed form;
 * checkAuth() keeps its historic operator-grade-only contract so every
 * other route (status/cancel/remove/verify/backlinks/stage) behaves
 * byte-identically, for the admin and for everyone else.
 */

const crypto = require('crypto');
const { requestValue } = require('./requestValues.js');
const ownership = require('./ownership.js');

module.exports = {

	// -- authorization -------------------------------------------------------
	// Signature-first, operator-key fallback. Ed25519 signature auth (see
	// importSign.js) survives production restarts; the operator-key env var
	// (AWTSMOOS_IMPORT_KEY) is transient and may be unset. Fail closed.
	checkAuth() {
		const pass = this._authPass();
		if (pass.kind === 'admin') return null;
		if (pass.kind === 'error') return pass.error;
		// Authenticated non-admin user on an operator-grade route:
		// reproduce the historic rejection exactly.
		const expected = process.env.AWTSMOOS_IMPORT_KEY;
		if (!expected) {
			return { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Post import is not configured on this server (no operator key and no valid signature).' };
		}
		const given = requestValue(this.$i, 'operatorKey') || this.$i?.body?.operatorKey || '';
		if (!given) return { success: false, error: 'FORBIDDEN', message: 'operatorKey is required.' };
		return { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' };
	},

	/** Detailed form for ownership-enforcing routes:
	 * { authError, caller } — caller is the ownership.js caller object
	 * ({ identity, isAdmin, via }) whenever the request is authenticated
	 * (admin OR any Awtsmoos user); authError is null exactly then.
	 * Routes using this MUST enforce ownership per target for non-admin
	 * callers. A bad signature or a wrong operator key fails closed
	 * even when a valid non-admin bearer is present, as before. */
	checkAuthDetailed() {
		const pass = this._authPass();
		if (pass.kind === 'error') return { authError: pass.error, caller: null };
		return { authError: null, caller: pass.caller };
	},

	/** Shared-helper seam for sibling mixins (notes/census/comments):
	 * the caller's ownership.js caller object, or null when
	 * unauthenticated. Operator-grade auth maps to the admin caller. */
	authenticate() {
		const pass = this._authPass();
		return pass.kind === 'error' ? null : pass.caller;
	},

	/** Shared-helper seam: authorizeWrite(identityOrCaller, post) ->
	 * boolean. Accepts a caller object or a bare identity string (the
	 * notes mixin's calling convention). Admin always; otherwise the
	 * post's owner must be one of the caller's aliases. */
	async authorizeWrite(identityOrCaller, post) {
		let caller = identityOrCaller;
		if (!caller || typeof caller !== 'object') {
			const identity = String(caller || '');
			if (!identity) return false;
			caller = { identity, userId: identity, accountId: identity, isAdmin: identity === 'asdf' };
		}
		return ownership.authorizeWrite(this.$i, caller, post);
	},

	/** Single authorization pass (checkSignatureAuth is replay-aware:
	 * it must run at most once per request, so both public forms share
	 * this; the result is memoized on the per-request instance).
	 * kind: 'admin' | 'user' | 'error'. */
	_authPass() {
		if (this.__authPassCache) return this.__authPassCache;
		const pass = this._authPassOnce();
		this.__authPassCache = pass;
		return pass;
	},

	_authPassOnce() {
		const sigResult = this.checkSignatureAuth();
		if (sigResult === null) return { kind: 'admin', caller: ownership.adminCaller('signature') }; // valid signature
		if (sigResult !== 'NO_ATTEMPT') return { kind: 'error', error: sigResult }; // bad signature: fail closed
		// OAuth operator identity (asdf): the operator's own authenticated
		// requests need neither an Ed25519 signature nor the operator key.
		const caller = ownership.authenticate(this.$i);
		if (caller && this.isOAuthOperator()) return { kind: 'admin', caller };
		// Operator key (admin) — checked before accepting a non-admin
		// caller so a WRONG key still fails closed, as before.
		const expected = process.env.AWTSMOOS_IMPORT_KEY;
		const given = requestValue(this.$i, 'operatorKey') || this.$i?.body?.operatorKey || '';
		if (expected && given) {
			const a = Buffer.from(String(given));
			const b = Buffer.from(String(expected));
			if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
				return { kind: 'admin', caller: ownership.adminCaller('operator-key') };
			}
			return { kind: 'error', error: { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' } };
		}
		// Any other authenticated Awtsmoos user, acting as themselves.
		if (caller) return { kind: 'user', caller };
		if (!expected) {
			return { kind: 'error', error: { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Post import is not configured on this server (no operator key and no valid signature).' } };
		}
		if (!given) return { kind: 'error', error: { success: false, error: 'FORBIDDEN', message: 'operatorKey is required.' } };
		return { kind: 'error', error: { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' } };
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
