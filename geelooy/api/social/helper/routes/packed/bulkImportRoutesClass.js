//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedBulkImportRoutes core: constructor, operator-key auth, payload loading, per-post file reads and the route map (split from bulkImportRoutes.js).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const packed = require('../../comments/richDb/PackedStore.js');
const paths = require('../../comments/richCommentPaths.js');
const { noteImportedComments } = require('../../search/rag/pendingCommentVectors.js');
const { requireMethod, requestValue } = require('./requestValues.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { perPostPath } = require('./bulkImportRoutesPaths.js');
const { flattenPayload } = require('./bulkImportRoutesComments.js');

class PackedBulkImportRoutes {

	/** @param {Object} $i - Active Awtsmoos request interface. */
	constructor($i) {
		this.$i = $i;
	}

	// -- authorization -------------------------------------------------------
	// Fail-closed operator key: the request must carry operatorKey matching
	// process.env.AWTSMOOS_BULK_IMPORT_KEY. When the env var is unset, every
	// call is rejected — never an open import door.
	// MAC-SEVERANCE: also accepts AWTSMOOS_DEPLOY_KEY so the VM can import
	// via the HTTPS deploy key without ever needing the Mac/tunnel.
	// Bulk-upload redesign §3.7: an authenticated Awtsmoos account may
	// also drive the comments lane (no operator key in the normal path);
	// the caller is recorded on the instance as __accountCaller so the
	// start/status/jobs/cancel routes can scope it to its own aliases.
	// Operator key and deploy key stay as the admin/machine paths. A
	// WRONG key still fails closed even with a valid bearer, as before.
	checkAuth() {
		const expected = process.env.AWTSMOOS_BULK_IMPORT_KEY;
		const deployKey = process.env.AWTSMOOS_DEPLOY_KEY;
		const given = requestValue(this.$i, 'operatorKey') || this.$i?.body?.operatorKey || '';
		if (given) {
			if (!expected && !deployKey) {
				return { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Bulk import operator key is not configured on this server.' };
			}
			const a = Buffer.from(String(given));
			for (const exp of [expected, deployKey]) {
				if (!exp) continue;
				const b = Buffer.from(String(exp));
				if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
					this.__accountCaller = null;
					return null;
				}
			}
			return { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' };
		}
		if (!expected && !deployKey) {
			return { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Bulk import operator key is not configured on this server.' };
		}
		try {
			const ownership = require('./ownership.js');
			const caller = ownership.authenticate(this.$i);
			if (caller) {
				this.__accountCaller = caller;
				return null;
			}
		} catch (_) { /* fall through to the key requirement */ }
		return { success: false, error: 'FORBIDDEN', message: 'operatorKey is required.' };
	}

	/** The account caller authorized by checkAuth, or null for key/admin callers. */
	accountCaller() {
		return this.__accountCaller || null;
	}

	/** The alias scope for an account caller (null = unrestricted/admin). */
	async accountScope() {
		const caller = this.accountCaller();
		if (!caller) return null;
		if (caller.isAdmin) return null;
		const ownership = require('./ownership.js');
		return ownership.callerAliasSet(this.$i, caller);
	}

	// -- payload loading ------------------------------------------------------
	loadItems(body) {
		let items = body.items;
		if (body.payloadFile) {
			const allowedRoots = [
				'social/heichelos/ikar/comments/atSeries',
				'social/heichelos/ikar/comments/atPayloads',
			];
			const dbRoot = this.$i?.db?.directory || this.$i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
			const p = path.resolve(dbRoot, String(body.payloadFile));
			const ok = allowedRoots.some(r => p.startsWith(path.resolve(dbRoot, r) + path.sep) || p === path.resolve(dbRoot, r));
			if (!ok) return { error: { success: false, error: 'PAYLOAD_PATH_REJECTED', message: 'payloadFile must live under the staged comments directory.' } };
			let parsed;
			try {
				parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
			} catch (e) {
				return { error: { success: false, error: 'PAYLOAD_UNREADABLE', message: e.message } };
			}
			items = flattenPayload(parsed);
		} else {
			items = flattenPayload(items);
		}
		if (!Array.isArray(items) || items.length === 0) {
			return { error: { success: false, error: 'NO_ITEMS', message: 'No importable items found.' } };
		}
		return { items };
	}

	// -- per-post import core (PATH2) ------------------------------------------
	readPerPostFile(db, aliasId, postId) {
		try {
			const target = perPostPath(aliasId, postId);
			const status = db.fs.stat(target);
			if (!status || !status.exists || status.type !== 'file') return null;
			return awts.deserializeBinary(db.fs.readRange(target, 0, status.size));
		} catch (_) { return null; }
	}

	/** @returns {Object<string,Function>} Packed bulk-import route map. */
	routes() {
		return {
			'/packed/import/bulk/start': this.start.bind(this),
			'/packed/import/bulk/status': this.status.bind(this),
			'/packed/import/bulk/jobs': this.list.bind(this),
			'/packed/import/bulk/cancel': this.cancel.bind(this),
		};
	}
}

module.exports = { PackedBulkImportRoutes };
