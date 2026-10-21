//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutesPostList
 * @description
 * Prototype-mixin sibling of AgentTranslateRoutes: post import and list methods, relocated verbatim.
 */

const { er } = require('../../general.js');
const { requireMethod, requestValue, limitValue } = require('../packed/requestValues.js');
const engine = require('./engine.js');
const tx = require('./transactions.js');
const { requestHeader, requireAgent, rateLimited, withRateLimit } = require('./routesHelpers.js');

module.exports = {
	/** Batch-import up to 25 posts in one idempotent transaction. */
	async postImport() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const posts = this.$i.$_POST?.posts || [];
		const res = await tx.agentImportPosts(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			heichelId: requestValue(this.$i, 'heichel', ''),
			seriesId: requestValue(this.$i, 'series', 'root'),
			posts: Array.isArray(posts) ? posts : []
		});
		if (res.error) return er(res.error);
		const body = withRateLimit(res.ok, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	},

	/** List the alias's own posts (scope=heichel lists the whole heichel). */
	async postList() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		const res = await tx.agentListPosts(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			heichelId: requestValue(this.$i, 'heichel', ''),
			scope: requestValue(this.$i, 'scope', 'mine'),
			limit: limitValue(requestValue(this.$i, 'limit'), 50)
		});
		if (res.error) return er(res.error);
		return { success: withRateLimit(res.ok, rl) };
	},
};
