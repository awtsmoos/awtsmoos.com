//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes core: signed stage auth and the route map (split from bulkPublishAllRoutes.js).
 */

const { PackedBulkImportRoutes } = require('./bulkImportRoutesClass.js');
const { requireMethod, requestValue } = require('./requestValues.js');
const importSign = require('./importSign.js');

class BulkPublishAllRoutes extends PackedBulkImportRoutes {
	// Signature-first auth override. The chunked /stage uploader signs each
	// chunk (op 'bulk/stage', payloadHash binds the exact chunk bytes via
	// sha256hex(uploadId:chunkIndex:dataB64)); other routes fall back to the
	// parent operator-key check. Fail closed on any bad signature.
	checkAuth() {
		const sig = requestValue(this.$i, 'sig');
		if (!sig) return super.checkAuth();
		const ts = requestValue(this.$i, 'ts');
		const op = String(requestValue(this.$i, 'op') || '');
		const heichelId = String(requestValue(this.$i, 'heichelId') || '');
		const payloadHash = String(requestValue(this.$i, 'payloadHash') || '');
		if (op !== 'bulk/stage') {
			return { success: false, error: 'SIG_BAD_OP', message: 'Unknown signed operation: ' + op };
		}
		const tsCheck = importSign.checkTimestamp(ts);
		if (!tsCheck.ok) return { success: false, error: 'SIG_' + tsCheck.error, message: 'Signature timestamp invalid or stale.' };
		const replayCheck = importSign.checkReplay(String(sig), ts);
		if (!replayCheck.ok) return { success: false, error: 'SIG_' + replayCheck.error, message: 'Signature replay detected.' };
		const body = this.$i?.body || {};
		const uploadId = String(body.uploadId || requestValue(this.$i, 'uploadId') || '');
		const chunkIndex = body.chunkIndex ?? requestValue(this.$i, 'chunkIndex');
		const dataB64 = String(body.data ?? requestValue(this.$i, 'data') ?? '');
		const expectedHash = importSign.sha256hex(uploadId + ':' + chunkIndex + ':' + dataB64);
		if (payloadHash !== expectedHash) {
			return { success: false, error: 'SIG_PAYLOAD_MISMATCH', message: 'Signature payload hash does not match the chunk.' };
		}
		const sigCheck = importSign.verifySignature({ ts, op, heichelId, payloadHash }, String(sig));
		if (!sigCheck.ok) {
			return { success: false, error: 'SIG_' + sigCheck.error, message: 'Invalid stage signature.' };
		}
		return null;
	}

	/** @returns {Object<string,Function>} parent routes + the stage upload path. */
	routes() {
		return {
			...super.routes(),
			'/packed/import/bulk/stage': this.stage.bind(this),
		};
	}
}

module.exports = { BulkPublishAllRoutes };
