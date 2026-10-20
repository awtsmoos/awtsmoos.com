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
	checkAuth() {
		const expected = process.env.AWTSMOOS_BULK_IMPORT_KEY;
		const deployKey = process.env.AWTSMOOS_DEPLOY_KEY;
		if (!expected && !deployKey) {
			return { success: false, error: 'IMPORT_NOT_CONFIGURED', message: 'Bulk import operator key is not configured on this server.' };
		}
		const given = requestValue(this.$i, 'operatorKey') || this.$i?.body?.operatorKey || '';
		if (!given) return { success: false, error: 'FORBIDDEN', message: 'operatorKey is required.' };
		const a = Buffer.from(String(given));
		// Check against bulk-import key first, then deploy key (Mac-severance path)
		for (const exp of [expected, deployKey]) {
			if (!exp) continue;
			const b = Buffer.from(String(exp));
			if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
				return null;
			}
		}
		return { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' };
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
