//B"H
//Blessed is He
//Boruch Hashem

/** @module BacklinksRepairMixin
 * The backlink-repair job body: reads each post back from the packed
 * shard, normalizes it, and merges its backlink into the alias parent
 * entry (idempotent set-add), with progress checkpoints.
 */

const fs = require('fs');
const path = require('path');
const { deriveAliasId, normalizePost } = require('./postValidate.js');
const { setJob } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { yieldTick } = require('./serverHealth.js');

module.exports = {

	async runBacklinks($i, b, files) {
		b.status = 'running';
		b.startedAt = Date.now();
		setJob(b);
		await yieldTick();
		try {
			for (let n = 0; n < files.length; n++) {
				const entry = files[n];
				try {
					const full = path.join(b.stagedDir, entry.file);
					const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
					const h = entry.heichelId || b.heichelId;
					const post = normalizePost(raw, h, Date.now());
					const aliasId = deriveAliasId(post.commentator, h, b.aliasId);
					const pid = String(post.postId || entry.postId || '');
					const s = String(post.seriesId || '');
					if (!aliasId || !pid) {
						b.errors.push({ postId: String(entry.postId || ''), problem: 'NO_ALIAS_OR_POSTID' });
					} else {
						// 1. alias -> org(heichel) link (the queryable org/profile link).
						// B"H 2026-10-11: value must be an object — boolean true
						// does not roundtrip through $i.db.get.
						const orgPath = `/social/aliases/${aliasId}/heichelosContributedTo/${h}`;
						let orgLink = null;
						try { orgLink = await $i.db.get(orgPath); } catch (_) { /* ignore */ }
						if (!orgLink) {
							await $i.db.write(orgPath, { aliasId, heichelId: h, linkedAt: Date.now(), by: 'post-import-api' });
							b.written++;
						}
						else b.skipped++;
						// 2. alias -> post backlink.
						const linkPath = `/social/aliases/${aliasId}/postsSubmitted/inHeichel/${h}/inSeries/${s}/${pid}`;
						let link = null;
						try { link = await $i.db.get(linkPath); } catch (_) { /* ignore */ }
						if (!link) {
							await $i.db.write(linkPath, { postId: pid, aliasId, heichelId: h, seriesId: s, linkedAt: Date.now(), by: 'post-import-api' });
							b.written++;
						}
						else b.skipped++;
					}
				} catch (e) {
					b.errors.push({ postId: String((entry && entry.postId) || ''), problem: 'BACKLINK_ERROR: ' + (e.message || e) });
				}
				b.checked++;
				if (n % 25 === 24) {
					b.updatedAt = Date.now();
					setJob(b);
					await yieldTick();
				}
			}
			b.status = 'done';
		} catch (e) {
			b.status = 'failed';
			b.errors.push({ postId: '', problem: 'BACKLINK_JOB_FAILED: ' + (e.message || e) });
		}
		b.finishedAt = Date.now();
		b.durationMs = b.finishedAt - b.startedAt;
		setJob(b);
		saveJobState($i, { ...b, spec: { heichelId: b.heichelId, source: 'backlinks:' + b.uploadId, stagedDir: b.stagedDir }, doneHashes: {} });
	}
};
