//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ImportStartMixin
 * The Awtsmoos watches the gate, from caller to durable state;
 * Awtsmoos.com will not promise work the ledger cannot create.
 */
const { requireMethod } = require('./requestValues.js');
const { buildJob } = require('./jobFactory.js');
const { resolveStartPosts } = require('./startPosts.js');
const { scheduleImportJob } = require('./importLaneScheduler.js');
const { startRequestOptions } = require('./startRequestOptions.js');
const { validateStartOwnership } = require('./startOwnership.js');
const { logAgentOperation, validateStartIdentities } = require('./startValidation.js');

module.exports = {
	/** Verify requester rights, then return only a truly accepted receipt. */
	async start() {
		const methodError = requireMethod(this.$i, 'POST');
		if (methodError) return methodError;
		const authentication = this.checkAuthDetailed();
		if (authentication.authError) return authentication.authError;
		const caller = authentication.caller;
		logAgentOperation(this.$i);
		const options = startRequestOptions(this.$i);
		const resolved = await resolveStartPosts(this, this.$i, options.body);
		if (!resolved.posts) return resolved;
		const posts = resolved.posts;
		const identityError = validateStartIdentities(posts);
		if (identityError) return identityError;
		const ownershipError = await validateStartOwnership(this, caller, posts, options);
		if (ownershipError) return ownershipError;
		const job = buildJob({
			dryRun: options.dryRun,
			heichelId: options.heichelId,
			isAdmin: !!caller?.isAdmin,
			jobAliasId: options.jobAliasId,
			jobAliasName: options.jobAliasName,
			posts,
			skipLiveCheck: options.skipLiveCheck,
			source: resolved.source,
			stagedDir: resolved.stagedDir,
			timeBudgetMs: options.timeBudgetMs
		});
		const admission = scheduleImportJob(this.$i, job, () => this.runJob(this.$i, job));
		if (admission.error) {
			return { error: admission.error, message: admission.message };
		}
		return {
			success: {
				jobId: job.id,
				status: job.status,
				dryRun: options.dryRun,
				totalPosts: posts.length,
				source: resolved.source
			}
		};
	}
};
