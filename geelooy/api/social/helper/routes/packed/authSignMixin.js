//B"H
//Blessed is He
//Boruch Hashem

/** @module AuthSignMixin
 * Ed25519 signature verification for import routes. The signature binds
 * { v, ts, op, heichelId, payloadHash }; payloadHash is computed per-op
 * so a signature for one operation can never authorize another.
 */

const { requestValue } = require('./requestValues.js');
const importSign = require('./importSign.js');

module.exports = {

	// -- Ed25519 signature authorization --------------------------------------
	// Verifies the request signature per importSign.js. The signature covers
	// { v, ts, op, heichelId, payloadHash }; payloadHash binds the payload:
	//   posts/start (staged): sha256hex(uploadId)
	//   posts/start (inline): sha256hex(JSON.stringify(posts))
	//   posts/status|cancel:  sha256hex('job:' + job)
	//   posts/jobs:           sha256hex('jobs')
	//   posts/verify:         sha256hex('verify:' + uploadId)
	// Returns null when the signature is valid, 'NO_ATTEMPT' when no
	// signature fields are present, or an error object on any failure.
	checkSignatureAuth() {
		const sig = requestValue(this.$i, 'sig');
		if (!sig) return 'NO_ATTEMPT';
		const ts = requestValue(this.$i, 'ts');
		const op = String(requestValue(this.$i, 'op') || '');
		const heichelId = String(requestValue(this.$i, 'heichelId') || '');
		const payloadHash = String(requestValue(this.$i, 'payloadHash') || '');
		const tsCheck = importSign.checkTimestamp(ts);
		if (!tsCheck.ok) return { success: false, error: 'SIG_' + tsCheck.error, message: 'Signature timestamp invalid or stale.' };
		const replayCheck = importSign.checkReplay(String(sig), ts);
		if (!replayCheck.ok) return { success: false, error: 'SIG_' + replayCheck.error, message: 'Signature replay detected.' };
		let expectedHash = '';
		if (op === 'posts/start') {
			const body = this.$i?.body || {};
			const uploadId = body.uploadId || requestValue(this.$i, 'uploadId');
			if (uploadId) {
				expectedHash = importSign.sha256hex(String(uploadId));
			} else {
				const postsVal = this.$i?.$_POST?.posts ?? body.posts;
				expectedHash = importSign.sha256hex(JSON.stringify(postsVal));
			}
		} else if (op === 'posts/status' || op === 'posts/cancel') {
			expectedHash = importSign.sha256hex('job:' + String(requestValue(this.$i, 'job') || ''));
		} else if (op === 'posts/jobs') {
			expectedHash = importSign.sha256hex('jobs');
		} else if (op === 'posts/verify') {
			const body = this.$i?.body || {};
			const uploadId = body.uploadId || requestValue(this.$i, 'uploadId');
			expectedHash = importSign.sha256hex('verify:' + String(uploadId || ''));
		} else if (op === 'posts/verify-status') {
			expectedHash = importSign.sha256hex('verify-status:' + String(requestValue(this.$i, 'verify') || ''));
		} else if (op === 'posts/ensure-backlinks') {
			const blBody = this.$i?.body || {};
			const blUploadId = blBody.uploadId || requestValue(this.$i, 'uploadId');
			expectedHash = importSign.sha256hex('backlinks:' + String(blUploadId || ''));
		} else if (op === 'posts/backlinks-status') {
			expectedHash = importSign.sha256hex('backlinks-status:' + String(requestValue(this.$i, 'backlinks') || ''));
		} else if (op === 'posts/flush-backlinks') {
			const fbBody = this.$i?.body || {};
			const fbJob = fbBody.job || requestValue(this.$i, 'job');
			expectedHash = importSign.sha256hex('flush-backlinks:' + String(fbJob || ''));
		} else if (op === 'posts/update') {
			const updBody = this.$i?.body || {};
			const updVal = updBody.updates ?? requestValue(this.$i, 'updates');
			expectedHash = importSign.sha256hex(JSON.stringify(updVal));
		} else if (op === 'posts/remove') {
			const rmBody = this.$i?.body || {};
			const rmH = rmBody.heichelId || requestValue(this.$i, 'heichelId');
			const rmP = rmBody.postId || requestValue(this.$i, 'postId');
			expectedHash = importSign.sha256hex('remove:' + String(rmH || '') + ':' + String(rmP || ''));
		} else {
			return { success: false, error: 'SIG_BAD_OP', message: 'Unknown signed operation: ' + op };
		}
		if (payloadHash !== expectedHash) {
			return { success: false, error: 'SIG_PAYLOAD_MISMATCH', message: 'Signature payload hash does not match the request payload.' };
		}
		const sigCheck = importSign.verifySignature({ ts, op, heichelId, payloadHash }, String(sig));
		if (!sigCheck.ok) {
			return { success: false, error: 'SIG_' + sigCheck.error, message: 'Invalid import signature.' };
		}
		return null;
	}
};
