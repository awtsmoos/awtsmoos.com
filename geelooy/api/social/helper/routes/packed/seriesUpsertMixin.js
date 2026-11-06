//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file seriesUpsertMixin.js
 * @description
 * Bulk-upload redesign §3.5: series as a first-class entity.
 *  POST /packed/import/series/upsert {heichelId, seriesId, set, expectedVersion?}
 *    — updates a series record WITHOUT touching its posts. Changes are
 *    versioned (seriesVersion bumps per upsert; expectedVersion guards
 *    stale writers with VERSION_CONFLICT). A staged import's series.json
 *    is applied through the same path at job start (applyStagedSeries).
 *  POST /packed/import/series/rebuild {heichelId, seriesId}
 *    — an explicit background job that rebuilds the series posts index
 *    from the packed core shard, with its own receipts, so a series can
 *    be rebuilt and verified without re-importing its posts.
 * Field mapping: set.title -> prateem name; set.description, ordering
 * and any other top-level fields land verbatim. Identity (id,
 * parentSeriesId) can never change through set; author may only be
 * changed by an admin. Non-admin callers may only touch series they
 * own (existing author in their alias set; for creates, heichel
 * ownership or an author that is one of their aliases).
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { requireMethod, requestValue } = require('./requestValues.js');
const { buildJob } = require('./jobFactory.js');
const { scheduleImportJob } = require('./importLaneScheduler.js');
const { getJobView, saveJobState } = require('./jobState.js');
const { appendReceipt, closeReceipts } = require('./jobReceipts.js');
const { setJob } = require('./jobStore.js');
const { finalizeJob } = require('./runJobWorkers.js');
const { armJobWatchdog } = require('./jobWatchdog.js');
const { yieldTick } = require('./serverHealth.js');
const ownership = require('./ownership.js');
const { seriesPrateemPath, seriesSubSeriesPath, seriesPostsPath, aliasSeriesTrackingPath } = require('../../seriesPaths.js');
const { ensureRootSeriesExists } = require('../../seriesRoot.js');
const { addSubSeriesToParent } = require('../../seriesSub.js');
const { databaseRoot } = require('./jobStatePaths.js');
const { SHARDS, shardFile } = require('../../packed/shardPaths.js');

const FORBIDDEN_SERIES_FIELDS = new Set(['__proto__', 'constructor', 'prototype', 'id', 'parentSeriesId']);
const SERIES_ID_RE = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,127}$/;

/** Normalize a series.json / upsert body into {seriesId, set}. */
function normalizeSeriesInput(input) {
	if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
	const seriesId = String(input.seriesId || input.id || '');
	if (!seriesId) return null;
	let set = null;
	if (input.set && typeof input.set === 'object' && !Array.isArray(input.set)) {
		set = { ...input.set };
	} else {
		set = {};
		for (const key of ['title', 'description', 'ordering', 'prateem', 'author']) {
			if (input[key] !== undefined) set[key] = input[key];
		}
	}
	if (set.prateem && typeof set.prateem === 'object' && !Array.isArray(set.prateem)) {
		const prateem = set.prateem;
		delete set.prateem;
		for (const [key, value] of Object.entries(prateem)) {
			if (set[key] === undefined) set[key] = value;
		}
	}
	return { seriesId, set, expectedVersion: input.expectedVersion };
}

/** Apply one normalized series change to the prateem record. */
async function applySeriesFields($i, heichelId, normalized, opts = {}) {
	const { seriesId, set, expectedVersion } = normalized;
	const caller = opts.caller || null;
	const scope = opts.scope || null;
	for (const key of Object.keys(set)) {
		if (FORBIDDEN_SERIES_FIELDS.has(key)) {
			return { error: 'FORBIDDEN_FIELD', message: 'field not allowed: ' + key };
		}
	}
	if (set.author !== undefined && caller && !caller.isAdmin && scope && !scope.has(String(set.author))) {
		return { error: 'FORBIDDEN_OWNERSHIP', message: 'author must be one of your aliases.' };
	}
	const prateemPath = seriesPrateemPath(heichelId, seriesId);
	let existing = null;
	try { existing = await $i.db.get(prateemPath); } catch (_) { /* missing -> create */ }
	if (existing && expectedVersion !== undefined && expectedVersion !== null) {
		const current = Number(existing.seriesVersion || 0);
		if (Number(expectedVersion) !== current) {
			return { error: 'VERSION_CONFLICT', message: 'series ' + seriesId + ' is at version ' + current + ', expected ' + expectedVersion + '. Re-read and retry.' };
		}
	}
	if (existing && caller && !caller.isAdmin) {
		const author = String(existing.author || '');
		if (!scope || !scope.has(author)) {
			return { error: 'FORBIDDEN_OWNERSHIP', message: 'series ' + seriesId + ' is owned by ' + (author || 'another user') + '.' };
		}
	}
	if (!existing && caller && !caller.isAdmin) {
		const author = String(set.author || '');
		const ownsHeichel = await ownership.isHeichelOwner($i, caller, heichelId);
		if (!ownsHeichel && !(author && scope && scope.has(author))) {
			return { error: 'FORBIDDEN_OWNERSHIP', message: 'creating a series in heichel ' + heichelId + ' requires heichel ownership or an author that is one of your aliases.' };
		}
	}
	const now = Date.now();
	const author = set.author !== undefined ? String(set.author) : (existing ? existing.author : (caller && !caller.isAdmin ? String(caller.identity) : 'asdf'));
	const next = existing ? { ...existing } : {
		id: seriesId,
		name: seriesId,
		description: '',
		author,
		parentSeriesId: 'root',
		createdAt: now
	};
	if (set.title !== undefined) next.name = String(set.title);
	if (set.description !== undefined) next.description = String(set.description);
	for (const [key, value] of Object.entries(set)) {
		if (key === 'title' || key === 'description') continue;
		next[key] = value;
	}
	next.author = author;
	next.seriesVersion = (Number(existing?.seriesVersion) || 0) + 1;
	next.updatedAt = now;
	await $i.db.write(prateemPath, next);
	if (!existing) {
		const rootRes = await ensureRootSeriesExists({ $i, heichelId });
		if (!rootRes || !rootRes.success) throw new Error('root ensure failed');
		let subs = null;
		try { subs = await $i.db.get(seriesSubSeriesPath(heichelId, seriesId)); } catch (_) {}
		if (!Array.isArray(subs)) await $i.db.write(seriesSubSeriesPath(heichelId, seriesId), []);
		const added = await addSubSeriesToParent({ $i, heichelId, parentSeriesId: 'root', childSeriesId: seriesId });
		if (added && added.error) throw new Error('add to parent failed: ' + (added.error.message || added.error));
		try { await $i.db.syncKeyInObj(aliasSeriesTrackingPath(author, heichelId), seriesId); } catch (_) {}
	}
	return { seriesId, heichelId, version: next.seriesVersion, created: !existing, prateem: next };
}

/** Stream the packed core shard once, collecting the series posts index. */
async function scanCoreShardForSeries($i, heichelId, seriesId) {
	const root = databaseRoot($i);
	const file = SHARDS['core'] ? shardFile(root, 'core') : '';
	if (!file || !fs.existsSync(file)) return { error: 'REBUILD_UNSUPPORTED', message: 'packed core shard is not a readable file on this server.' };
	const prefix = '/posts/' + heichelId + '/';
	const found = new Map();
	const stream = fs.createReadStream(file, 'utf8');
	const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
	for await (const line of rl) {
		if (!line) continue;
		let rec;
		try { rec = JSON.parse(line); } catch (_) { continue; }
		const key = rec && rec.key;
		if (typeof key !== 'string' || !key.startsWith(prefix)) continue;
		const value = rec.value;
		if (!value || typeof value !== 'object') continue;
		if (String(value.seriesId || '') !== seriesId) continue;
		const postId = String(value.postId || value.id || key.slice(prefix.length));
		found.set(postId, { author: value.aliasId || '', postId, title: value.title || '' });
	}
	return { found };
}

module.exports = {
	normalizeSeriesInput,
	applySeriesFields,

	/** Apply a staged import's series.json (object or array) before any post writes. */
	async applyStagedSeries($i, job) {
		const raw = job?.spec?.series;
		if (!raw) return { applied: 0 };
		const list = Array.isArray(raw) ? raw : [raw];
		const heichelId = job.spec.heichelId;
		const caller = job.caller || null;
		const scope = caller && !caller.isAdmin ? await ownership.callerAliasSet($i, caller) : null;
		const applied = [];
		for (const item of list) {
			const normalized = normalizeSeriesInput(item);
			if (!normalized) return { error: 'BAD_SERIES_JSON', message: 'series.json entries need seriesId.' };
			const done = await applySeriesFields($i, heichelId, normalized, { caller, scope });
			if (done.error) return { error: done.error, message: done.message };
			applied.push(done);
		}
		return { applied: applied.length, series: applied.map(a => a.seriesId) };
	},

	/** POST /packed/import/series/upsert {heichelId, seriesId, set, expectedVersion?} */
	async seriesUpsert() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const detailed = this.checkAuthDetailed();
		if (detailed.authError) return detailed.authError;
		const caller = detailed.caller;
		const body = Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
		const heichelId = String(body.heichelId || requestValue(this.$i, 'heichelId') || '');
		const normalized = normalizeSeriesInput(body);
		if (!heichelId || !normalized) {
			return { success: false, error: 'BAD_ARGS', message: 'heichelId, seriesId and set are required.' };
		}
		if (!SERIES_ID_RE.test(normalized.seriesId)) {
			return { success: false, error: 'BAD_SERIES_ID', message: 'seriesId is not a valid series id.' };
		}
		const scope = caller && !caller.isAdmin ? await ownership.callerAliasSet(this.$i, caller) : null;
		let done;
		try {
			done = await applySeriesFields(this.$i, heichelId, normalized, { caller, scope });
		} catch (error) {
			return { success: false, error: 'SERIES_UPSERT_FAILED', message: String((error && error.message) || error) };
		}
		if (done.error) return { success: false, error: done.error, message: done.message };
		return { success: { heichelId, seriesId: done.seriesId, version: done.version, created: done.created } };
	},

	/** POST /packed/import/series/rebuild {heichelId, seriesId} — explicit rebuild job. */
	async seriesRebuild() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const detailed = this.checkAuthDetailed();
		if (detailed.authError) return detailed.authError;
		const caller = detailed.caller;
		const body = Object.assign({}, this.$i?.$_POST || {}, this.$i?.body || {});
		const heichelId = String(body.heichelId || requestValue(this.$i, 'heichelId') || '');
		const seriesId = String(body.seriesId || requestValue(this.$i, 'seriesId') || '');
		if (!heichelId || !SERIES_ID_RE.test(seriesId)) {
			return { success: false, error: 'BAD_ARGS', message: 'heichelId and a valid seriesId are required.' };
		}
		if (caller && !caller.isAdmin) {
			const scope = await ownership.callerAliasSet(this.$i, caller);
			let existing = null;
			try { existing = await this.$i.db.get(seriesPrateemPath(heichelId, seriesId)); } catch (_) {}
			const author = String(existing?.author || '');
			if (!author || !scope.has(author)) {
				const ownsHeichel = await ownership.isHeichelOwner(this.$i, caller, heichelId);
				if (!ownsHeichel) return { success: false, error: 'FORBIDDEN_OWNERSHIP', message: 'series ' + seriesId + ' is not yours to rebuild.' };
			}
		}
		const job = buildJob({
			kind: 'series-rebuild',
			dryRun: false,
			heichelId,
			isAdmin: !!caller?.isAdmin,
			jobAliasId: heichelId + '-import',
			jobAliasName: heichelId + ' Import',
			posts: [],
			skipLiveCheck: true,
			source: 'series-rebuild:' + heichelId + '/' + seriesId,
			caller,
			timeBudgetMs: 600000
		});
		job.spec.seriesId = seriesId;
		job.totalPosts = 0;
		const admission = scheduleImportJob(this.$i, job, () => this.runSeriesRebuild(this.$i, job));
		if (admission.error) {
			return { error: admission.error, message: admission.message, retryable: admission.retryable, retryAfterMs: admission.retryAfterMs, persistError: admission.persistError || undefined };
		}
		return { success: { jobId: job.id, status: job.status, held: admission.held || false, heichelId, seriesId } };
	},

	/** Run one series-rebuild job: scan the core shard, rewrite the index, receipt each post. */
	async runSeriesRebuild($i, job) {
		await yieldTick();
		job.status = 'running';
		job.updatedAt = Date.now();
		setJob(job);
		saveJobState($i, job);
		const heichelId = job.spec.heichelId;
		const seriesId = job.spec.seriesId;
		armJobWatchdog($i, job);
		try {
			const scanned = await scanCoreShardForSeries($i, heichelId, seriesId);
			if (scanned.error) throw new Error(scanned.error + ': ' + scanned.message);
			let current = {};
			try { current = await $i.db.get(seriesPostsPath(heichelId, seriesId)) || {}; } catch (_) { current = {}; }
			const next = {};
			let wrote = 0, skipped = 0;
			for (const [postId, entry] of scanned.found) {
				next[postId] = entry;
				const before = current[postId];
				if (before && before.author === entry.author && before.title === entry.title) {
					skipped++;
					appendReceipt($i, job, { postId, status: 'skipped' });
				} else {
					wrote++;
					appendReceipt($i, job, { postId, status: 'wrote' });
				}
			}
			await $i.db.write(seriesPostsPath(heichelId, seriesId), next);
			job.totalPosts = scanned.found.size;
			job.postsDone = scanned.found.size;
			job.wrote = wrote;
			job.skipped = skipped;
			job.status = 'done';
		} catch (error) {
			job.status = 'failed';
			job.errors.push({ message: 'SERIES_REBUILD_FAILED: ' + (error.message || error) });
		}
		try { closeReceipts($i, job); } catch (_) { /* best effort */ }
		finalizeJob($i, job);
	}
};
