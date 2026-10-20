//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedShardRoutes core: constructor, route map, signature auth, body, start and status (split from shardRoutes.js).
 */

const fs = require('fs');
const { requireMethod, requestValue } = require('./requestValues.js');
const { er } = require('../../general.js');
const { verifySignature, checkTimestamp, checkReplay } = require('./deploySign.js');
const { stagingRoot, planPath, stagedFile, liveFile, validateShard, validateFileName, readPlan, ragRoot } = require('./shardRoutesPaths.js');

class PackedShardRoutes {

	constructor($i) {
		this.$i = $i;
	}

	routes() {
		return {
			'/packed/shard/start': this.start.bind(this),
			'/packed/shard/chunk': this.chunk.bind(this),
			'/packed/shard/status': this.status.bind(this),
			'/packed/shard/finalize': this.finalize.bind(this),
			'/packed/shard/verify': this.verify.bind(this),
			'/packed/shard/query': this.query.bind(this),
		};
	}

	// -- authorization: Ed25519 canonical envelope, same as deploy push ------
	// signedFiles is the exact `files` array covered by the signature.
	checkAuth(signedFiles) {
		const $i = this.$i;
		const body = this.body();
		const sig = body.sig || requestValue($i, 'sig') || '';
		if (!sig) return er({ code: 'FORBIDDEN', message: 'Shard auth required: Ed25519 sig.' });
		const ts = body.ts ?? requestValue($i, 'ts');
		const tchk = checkTimestamp(ts);
		if (!tchk.ok) return er({ code: 'FORBIDDEN', message: `Shard signature rejected: ${tchk.error}.` });
		const message = String(body.message ?? requestValue($i, 'message') ?? '');
		const vchk = verifySignature({ ts, message, files: signedFiles }, sig);
		if (!vchk.ok) return er({ code: 'FORBIDDEN', message: `Shard signature rejected: ${vchk.error}.` });
		const rchk = checkReplay(String(sig), ts);
		if (!rchk.ok) return er({ code: 'FORBIDDEN', message: `Shard signature rejected: ${rchk.error}.` });
		return null;
	}

	body() {
		// Mirror deployRoutes: parsed JSON may live in $i.body or $i.$_POST.
		return { ...(this.$i?.$_POST || {}), ...(this.$i?.body || {}) };
	}

	// -- POST /packed/shard/start -------------------------------------------
	async start() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const { shard, files = [] } = this.body();
		const auth = this.checkAuth(files);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		if (!Array.isArray(files) || !files.length) {
			return er({ code: 'NO_FILES', message: 'files[] plan is required.' });
		}
		for (const f of files) {
			const vf = validateFileName(shard, f?.name);
			if (!vf.ok) return er(vf);
			if (!Number.isInteger(f?.bytes) || f.bytes < 0) {
				return er({ code: 'BAD_PLAN', message: `Bad byte count for ${f?.name}.` });
			}
			if (!/^[0-9a-f]{64}$/.test(String(f?.sha256 || ''))) {
				return er({ code: 'BAD_PLAN', message: `Bad sha256 for ${f?.name}.` });
			}
		}
		const dir = stagingRoot(this.$i, shard);
		fs.mkdirSync(dir, { recursive: true });
		const plan = { shard, files, startedAt: new Date().toISOString() };
		fs.writeFileSync(planPath(this.$i, shard), JSON.stringify(plan, null, 2) + '\n', 'utf8');
		// Pre-create staged files at 0 bytes so status is truthful pre-chunk.
		for (const f of files) {
			const sf = stagedFile(this.$i, shard, f.name);
			if (!fs.existsSync(sf)) fs.writeFileSync(sf, Buffer.alloc(0));
		}
		return { success: true, shard, files: files.map(f => f.name) };
	}

	// -- GET /packed/shard/status -------------------------------------------
	async status() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const shard = requestValue(this.$i, 'shard');
		const auth = this.checkAuth([{ shard, op: 'status' }]);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const plan = readPlan(this.$i, shard);
		const staged = {};
		if (plan) {
			for (const f of plan.files) {
				const sf = stagedFile(this.$i, shard, f.name);
				staged[f.name] = fs.existsSync(sf) ? fs.statSync(sf).size : 0;
			}
		}
		const live = {};
		for (const sfx of ALLOWED_SUFFIXES) {
			const lf = liveFile(this.$i, shard + sfx);
			if (fs.existsSync(lf)) live[shard + sfx] = fs.statSync(lf).size;
		}
		return { success: true, shard, plan, staged, live, ragRoot: ragRoot(this.$i) };
	}
}

module.exports = { PackedShardRoutes };
