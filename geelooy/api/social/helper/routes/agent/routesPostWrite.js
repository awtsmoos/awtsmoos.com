//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutesPostWrite
 * @description
 * Prototype-mixin sibling of AgentTranslateRoutes: post create, edit and delete methods, relocated verbatim.
 */

const { er } = require('../../general.js');
const { requireMethod, requestValue } = require('../packed/requestValues.js');
const engine = require('./engine.js');
const tx = require('./transactions.js');
const { requestHeader, requireAgent, rateLimited, withRateLimit } = require('./routesHelpers.js');

module.exports = {
	// ------------------------------------------------------------------
	// Agent-as-user transactions: everything the key's user can do.
	// The API key IS the user; every write below is idempotent,
	// rate-limited, and permission-checked (own alias + heichel authority,
	// or the post's own author alias for edits/deletes).
	// ------------------------------------------------------------------

	/** Create a post in a heichel the alias may write to. */
	async postCreate() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const res = await tx.agentCreatePost(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			heichelId: requestValue(this.$i, 'heichel', ''),
			seriesId: requestValue(this.$i, 'series', 'root'),
			type: requestValue(this.$i, 'type', 'post'),
			title: requestValue(this.$i, 'title', ''),
			content: requestValue(this.$i, 'content', ''),
			sections: this.$i.$_POST?.sections || [],
			rootAssets: this.$i.$_POST?.rootAssets || [],
			postId: requestValue(this.$i, 'postId', '') || null,
			parentQuestionId: requestValue(this.$i, 'questionId', '')
		});
		if (res.error) return er(res.error);
		const body = withRateLimit({ post: res.ok }, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	},

	/** Edit a post the alias authored or has heichel authority over. */
	async postEdit() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const res = await tx.agentEditPost(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			heichelId: requestValue(this.$i, 'heichel', ''),
			seriesId: requestValue(this.$i, 'series', 'root'),
			postId: requestValue(this.$i, 'post', requestValue(this.$i, 'postId', '')),
			newTitle: requestValue(this.$i, 'title', requestValue(this.$i, 'newTitle', '')) || undefined,
			newContent: requestValue(this.$i, 'content', requestValue(this.$i, 'newContent', '')) || undefined,
			dayuh: this.$i.$_POST?.dayuh
		});
		if (res.error) return er(res.error);
		const body = withRateLimit(res.ok, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	},

	/** Delete a post the alias authored or has heichel authority over. */
	async postDelete() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const res = await tx.agentDeletePost(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			heichelId: requestValue(this.$i, 'heichel', ''),
			seriesId: requestValue(this.$i, 'series', 'root'),
			postId: requestValue(this.$i, 'post', requestValue(this.$i, 'postId', ''))
		});
		if (res.error) return er(res.error);
		const body = withRateLimit(res.ok, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	},
};
