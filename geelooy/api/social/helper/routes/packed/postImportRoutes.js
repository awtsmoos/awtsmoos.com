//B"H
//Blessed is He
//Boruch Hashem

/** @module PostImportRoutes
 * Packed social-database post import routes: bulk post import jobs with
 * auth, idempotency, verification, and backlink repair. This file is the
 * slim composition root - the class shell plus mixin wiring. All logic
 * lives in packed/ modules (see README.md in this directory).
 * AI SAFEGUARD: the exported surface { PackedPostImportRoutes,
 * contentHash, normalizePost, canonicalBytes, deriveAliasId } is consumed
 * across the codebase; do not rename or drop any of it.
 */

const postValidate = require('./postValidate.js');
const PackedPostImportRoutes = class PackedPostImportRoutes {
	constructor($i) {
		this.$i = $i;
		// B"H 2026-10-20 (crash-guard): start the event-loop lag monitor
		// (idempotent, unref'd 1s probe). It feeds the shed circuit
		// breaker that protects imports from starving web traffic.
		require('./eventLoopMonitor.js').startEventLoopMonitor();
		require('../../safeguards/resourceAlarm.js').startResourceAlarm();
	}


	/** @returns {Object<string,Function>} Packed post-import route map. */
	routes() {
		return {
			'/packed/import/posts/start': this.start.bind(this),
			'/packed/import/posts/status': this.status.bind(this),
			'/packed/import/posts/jobs': this.list.bind(this),
			'/packed/import/posts/cancel': this.cancel.bind(this),
			'/packed/import/posts/verify': this.verify.bind(this),
			'/packed/import/posts/verify-status': this.verifyStatus.bind(this),
			'/packed/import/posts/ensure-backlinks': this.ensureBacklinks.bind(this),
			'/packed/import/posts/backlinks-status': this.backlinksStatus.bind(this),
			// B"H 2026-10-14 (import-speed): replay a job's persisted
			// deferred-backlink queue (crash recovery for the post-job flush).
			'/packed/import/posts/flush-backlinks': this.flushBacklinks.bind(this),
			'/packed/import/posts/remove': this.remove.bind(this),
			'/packed/import/posts/update': this.update.bind(this),
			'/packed/notes': this.notesRoute.bind(this),
			'/packed/notes/feed': this.notesFeed.bind(this),
			'/packed/notes/bulk': this.notesBulk.bind(this),
			'/packed/notes/resolve': this.notesResolve.bind(this),
			'/packed/notes/rebuild-index': this.notesRebuildIndex.bind(this),
			'/packed/census': this.census.bind(this),
			'/packed/submissions': this.submissionsRoot.bind(this),
			'/packed/submissions/mine': this.listMySubmissions.bind(this),
			'/packed/submissions/settings': this.submissionsSettingsRoute.bind(this),
			'/packed/submissions/approve': this.approveSubmission.bind(this),
			'/packed/submissions/deny': this.denySubmission.bind(this),
			'/packed/submissions/reverse': this.reverseSubmission.bind(this),
			'/packed/submissions/decisions': this.listSubmissionDecisions.bind(this),
		};
	}
};

Object.assign(PackedPostImportRoutes.prototype,
	require('./authCoreMixin.js'),
	require('./authSignMixin.js'),
	require('./liveHashMixin.js'),
	require('./aliasMixin.js'),
	require('./nativeWriteMixin.js'),
	require('./backlinksMixin.js'),
	require('./seriesAddsMixin.js'),
	require('./stageMixin.js'),
	require('./runJobMixin.js'),
	require('./startMixin.js'),
	require('./statusMixin.js'),
	require('./cancelMixin.js'),
	require('./removeMixin.js'),
	require('./verifyMixin.js'),
	require('./runVerifyMixin.js'),
	require('./ensureBacklinksMixin.js'),
	require('./backlinksRepairMixin.js'),
	require('./backlinksStatusMixin.js'),
	require('./updateMixin.js'),
	require('./censusMixin.js'),
	require('./notesMixin.js'),
	require('./submissionsMixin.js'));

module.exports = { PackedPostImportRoutes,
	contentHash: postValidate.contentHash,
	normalizePost: postValidate.normalizePost,
	canonicalBytes: postValidate.canonicalBytes,
	deriveAliasId: postValidate.deriveAliasId };
