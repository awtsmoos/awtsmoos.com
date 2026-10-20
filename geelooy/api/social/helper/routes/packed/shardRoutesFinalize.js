//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedShardRoutes finalize endpoint: full-file verification and atomic promotion (split from shardRoutes.js).
 */

const fs = require('fs');
const { requireMethod, requestValue } = require('./requestValues.js');
const { er } = require('../../general.js');
const { stagingRoot, stagedFile, liveFile, sha256File, validateShard, readPlan, ragRoot } = require('./shardRoutesPaths.js');

module.exports = {
	// -- POST /packed/shard/finalize ----------------------------------------
	async finalize() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const { shard, replace } = this.body();
		const auth = this.checkAuth([{ shard, op: 'finalize', replace: replace === true }]);
		if (auth) return auth;
		const vs = validateShard(shard);
		if (!vs.ok) return er(vs);
		const plan = readPlan(this.$i, shard);
		if (!plan) return er({ code: 'NO_PLAN', message: 'Nothing to finalize.' });
		// Verify every staged file: size + full SHA-256 vs plan.
		for (const f of plan.files) {
			const sf = stagedFile(this.$i, shard, f.name);
			if (!fs.existsSync(sf)) return er({ code: 'INCOMPLETE', message: `Missing staged file ${f.name}.` });
			const size = fs.statSync(sf).size;
			if (size !== f.bytes) {
				return er({ code: 'INCOMPLETE', message: `${f.name}: staged ${size} != planned ${f.bytes}.` });
			}
			const sha = sha256File(sf);
			if (sha !== f.sha256) {
				return er({ code: 'SHA_MISMATCH', message: `${f.name}: staged sha ${sha} != planned ${f.sha256}.` });
			}
		}
		// Refuse to overwrite live files (Yaakov's law) unless replace:true.
		for (const f of plan.files) {
			const lf = liveFile(this.$i, f.name);
			if (fs.existsSync(lf) && replace !== true) {
				return er({ code: 'WOULD_OVERWRITE', message: `Live file exists: ${f.name}. Pass replace:true to supersede.` });
			}
		}
		// Atomic promotion: rename into the live RAG root.
		const receipt = {};
		for (const f of plan.files) {
			const sf = stagedFile(this.$i, shard, f.name);
			const lf = liveFile(this.$i, f.name);
			const tmp = lf + '.promoting';
			fs.copyFileSync(sf, tmp);
			fs.renameSync(tmp, lf);
			receipt[f.name] = { bytes: f.bytes, sha256: sha256File(lf) };
		}
		// Cleanup staging only after every file promoted cleanly.
		fs.rmSync(stagingRoot(this.$i, shard), { recursive: true, force: true });
		return { success: true, shard, live: receipt, ragRoot: ragRoot(this.$i) };
	}
};
