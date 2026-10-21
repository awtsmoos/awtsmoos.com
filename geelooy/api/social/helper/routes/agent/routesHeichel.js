//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutesHeichel
 * @description
 * Prototype-mixin sibling of AgentTranslateRoutes: heichel transaction methods, relocated verbatim.
 */

const { er } = require('../../general.js');
const { requireMethod, requestValue } = require('../packed/requestValues.js');
const engine = require('./engine.js');
const tx = require('./transactions.js');
const { requestHeader, requireAgent, rateLimited, withRateLimit } = require('./routesHelpers.js');

module.exports = {
	/** Create a heichel owned by the alias. */
	async heichelCreate() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const res = await tx.agentCreateHeichel(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			name: requestValue(this.$i, 'name', ''),
			description: requestValue(this.$i, 'description', ''),
			isPublic: requestValue(this.$i, 'isPublic', 'yes')
		});
		if (res.error) return er(res.error);
		const body = withRateLimit({ heichel: res.ok }, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	},

	/** Edit a heichel the alias has authority over. */
	async heichelEdit() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const res = await tx.agentEditHeichel(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			heichelId: requestValue(this.$i, 'heichel', ''),
			name: requestValue(this.$i, 'name', '') || undefined,
			description: requestValue(this.$i, 'description', '') || undefined,
			dayuh: this.$i.$_POST?.dayuh
		});
		if (res.error) return er(res.error);
		const body = withRateLimit(res.ok, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	},

	/** Delete a heichel the alias has authority over (confirm:true required). */
	async heichelDelete() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'write');
		if (!rl.allowed) return rateLimited(rl);
		const idemKey = requestHeader(this.$i, 'idempotency-key') || requestValue(this.$i, 'idempotencyKey', '');
		const replay = await this.idem.lookup(idemKey);
		if (replay) return { success: { ...replay.body, idempotentReplay: true } };
		const confirmRaw = requestValue(this.$i, 'confirm', this.$i.$_POST?.confirm);
		const res = await tx.agentDeleteHeichel(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', ''),
			heichelId: requestValue(this.$i, 'heichel', ''),
			confirm: confirmRaw === true || confirmRaw === 'true'
		});
		if (res.error) return er(res.error);
		const body = withRateLimit(res.ok, rl);
		await this.idem.store(idemKey, body);
		return { success: body };
	},

	/** List heichelos created by the alias. */
	async heichelList() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const auth = await requireAgent(this.$i);
		if (!auth.ok) return auth.error;
		const rl = engine.checkRateLimit(auth.credentialHash, 'read');
		if (!rl.allowed) return rateLimited(rl);
		const res = await tx.agentListHeichelos(this.$i, {
			userId: auth.userId,
			aliasId: requestValue(this.$i, 'alias', '')
		});
		if (res.error) return er(res.error);
		return { success: withRateLimit({ heichelos: res.ok }, rl) };
	},
};
