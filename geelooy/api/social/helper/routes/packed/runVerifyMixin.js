//B"H
//Blessed is He
//Boruch Hashem

/** @module RunVerifyMixin
 * The verify-job engine: loads the staged tarball, streams the live
 * shard once, and classifies each post as present/missing/different
 * with hash evidence. Read-only - never writes posts.
 */

const fs = require('fs');
const path = require('path');
const { contentHash, deriveAliasId, normalizePost } = require('./postValidate.js');
const { appendJobLog } = require('./jobLog.js');
const { setJob } = require('./jobStore.js');
const { saveJobState, getJobView } = require('./jobState.js');
const { yieldTick } = require('./serverHealth.js');

module.exports = {

	/** Stream the core JSONL shard once into {postId -> contentHash} for a heichel. O(1) memory. */
	streamLiveHashes($i, heichelId) {
		return new Promise((resolve) => {
			const cache = new Map();
			const prefix = '/posts/' + heichelId + '/';
			const root = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
			const { SHARDS, shardFile } = require('../../packed/shardPaths.js');
			const file = SHARDS['core'] ? shardFile(root, 'core') : '';
			if (!file || !fs.existsSync(file)) return resolve(cache);
			const readline = require('readline');
			const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
			rl.on('line', (line) => {
				if (!line) return;
				let rec;
				try { rec = JSON.parse(line); } catch (_) { return; }
				const key = rec && rec.key;
				if (typeof key !== 'string' || !key.startsWith(prefix)) return;
				try { cache.set(key.slice(prefix.length), contentHash(rec.value)); } catch (_) { /* ignore */ }
			});
			rl.on('close', () => resolve(cache));
			rl.on('error', () => resolve(cache));
		});
	},


	async runVerify($i, v, files) {
		await yieldTick();
		v.status = 'running';
		v.startedAt = Date.now();
		setJob(v);
		try {
			const liveHashes = await this.streamLiveHashes($i, v.heichelId);
			await yieldTick();
			for (let n = 0; n < files.length; n++) {
				const entry = files[n];
				const postId = String(entry.postId || '');
				let problem = null;
				let expectedHash = null;
				try {
					const full = path.join(v.stagedDir, entry.file);
					const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
					const h = entry.heichelId || v.heichelId;
					const post = normalizePost(raw, h, Date.now());
					const aliasName = (post.commentator && String(post.commentator).trim()) || v.aliasName;
					post.aliasId = deriveAliasId(post.commentator, h, v.aliasId);
					expectedHash = contentHash(post);
					// 1. packed mirror check (streamed map — no per-post file scan).
					const liveHash = liveHashes.get(postId);
					if (liveHash !== expectedHash) {
						problem = liveHash ? 'PACKED_HASH_MISMATCH' : 'PACKED_NOT_FOUND';
					} else {
						// 2. native first-class record check (byte-exact in AwtsmoosDB format).
						let live = null;
						try { live = await $i.db.get(`/social/heichelos/${h}/posts/${postId}`); } catch (_) { /* ignore */ }
						if (!live) problem = 'NATIVE_NOT_FOUND';
						else if (contentHash(live) !== expectedHash) problem = 'NATIVE_HASH_MISMATCH';
						else {
							// 3. alias link check (alias -> post, queryable).
							let link = null;
							try { link = await $i.db.get(`/social/aliases/${post.aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${post.seriesId}/${postId}`); } catch (_) { /* ignore */ }
							if (!link) problem = 'ALIAS_LINK_MISSING';
						}
					}
				} catch (e) {
					problem = 'VERIFY_ERROR: ' + (e.message || e);
				}
				if (problem) v.mismatches.push({ postId, problem });
				else v.ok++;
				v.checked++;
				if (n % 25 === 24) {
					v.updatedAt = Date.now();
					setJob(v);
					await yieldTick();
				}
			}
			v.status = 'done';
		} catch (e) {
			v.status = 'failed';
			v.mismatches.push({ postId: '', problem: 'VERIFY_JOB_FAILED: ' + (e.message || e) });
		}
		v.finishedAt = Date.now();
		v.durationMs = v.finishedAt - v.startedAt;
		setJob(v);
		saveJobState($i, { ...v, spec: { heichelId: v.heichelId, source: 'verify:' + v.uploadId, stagedDir: v.stagedDir }, doneHashes: {} });
		appendJobLog($i, { jobId: v.id, event: 'verify-' + v.status, checked: v.checked, ok: v.ok, mismatches: v.mismatches.length, durationMs: v.durationMs });
	}
};
