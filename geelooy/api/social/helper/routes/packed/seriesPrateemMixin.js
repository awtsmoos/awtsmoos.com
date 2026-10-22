//B"H
//Blessed is He
//Boruch Hashem

/** @module SeriesPrateemMixin
 * B"H 2026-10-22 (prateem-gap fix): packed imports historically wrote
 * posts without ever creating the series prateem record, leaving the
 * series undiscoverable (no /details, absent from the browse tree)
 * even though every post read fine. This mixin closes the gap at the
 * root: after a job reaches terminal state, every series the job
 * wrote to is ensured a prateem in the exact shape of the official
 * create path (helper/seriesCreate.js makeNewSeries), reusing its
 * own helpers (seriesPaths / seriesRoot / seriesSub).
 *
 * Contract:
 * - Idempotent: an existing prateem is never overwritten; an existing
 *   non-root parent link is never disturbed.
 * - Point reads/writes only (prateem, subSeries arrays) - never the
 *   legacy series posts index whose read-modify-write hangs the loop
 *   (see the flushSeriesAdds disable note in runJobWorkers.js). The
 *   packed grouped index stays the membership of record.
 * - Imports carry no seriesName (none exists anywhere in the packed
 *   path), so a created prateem's name is the seriesId itself;
 *   author is the job's importing alias (job.spec.aliasId).
 * - Never fatal: launched fire-and-forget after the job is terminal
 *   (same pattern as the deferred backlink flush); failures land in
 *   the job log + job.errors, and the census flag
 *   series_missing_prateem remains the residual detector.
 */

const { seriesPrateemPath, seriesSubSeriesPath, aliasSeriesTrackingPath } = require('../../seriesPaths.js');
const { ensureRootSeriesExists } = require('../../seriesRoot.js');
const { addSubSeriesToParent } = require('../../seriesSub.js');
const { appendJobLog } = require('./jobLog.js');

module.exports = {

	async ensureJobSeriesPrateem($i, job) {
		const created = [], existed = [], failed = [];
		const author = (job.spec && job.spec.aliasId) || 'asdf';
		for (const key of job.seriesAdds.keys()) {
			let h, s;
			try { [h, s] = JSON.parse(key); } catch (_) { continue; }
			if (!h || !s || s === 'root') continue;
			try {
				let existing = null;
				try { existing = await $i.db.get(seriesPrateemPath(h, s)); } catch (_) {}
				if (existing && existing.id) {
					existed.push(h + '/' + s);
					// Record exists: only heal a missing root listing
					// when the record itself declares root parentage.
					if (!existing.parentSeriesId || existing.parentSeriesId === 'root') {
						await addSubSeriesToParent({ $i, heichelId: h, parentSeriesId: 'root', childSeriesId: s });
					}
					continue;
				}
				const rootRes = await ensureRootSeriesExists({ $i, heichelId: h });
				if (!rootRes || !rootRes.success) throw new Error('root ensure failed');
				// Mirror makeNewSeries' prateem verbatim (same fields,
				// same order); parent defaults to 'root', its default.
				await $i.db.write(seriesPrateemPath(h, s), {
					id: s,
					name: s,
					description: '',
					author,
					parentSeriesId: 'root',
					createdAt: Date.now()
				});
				let subs = null;
				try { subs = await $i.db.get(seriesSubSeriesPath(h, s)); } catch (_) {}
				if (!Array.isArray(subs)) await $i.db.write(seriesSubSeriesPath(h, s), []);
				const added = await addSubSeriesToParent({ $i, heichelId: h, parentSeriesId: 'root', childSeriesId: s });
				if (added && added.error) throw new Error('add to parent failed: ' + (added.error.message || added.error));
				// Alias tracking is non-critical (makeNewSeries step 6).
				try { await $i.db.syncKeyInObj(aliasSeriesTrackingPath(author, h), s); } catch (_) {}
				created.push(h + '/' + s);
			} catch (e) {
				failed.push(h + '/' + s + ': ' + (e.message || e));
			}
		}
		try {
			appendJobLog($i, { jobId: job.id, event: 'series-prateem-ensure', created, existed, failed });
		} catch (_) {}
		if (failed.length) {
			console.error('ensureJobSeriesPrateem failures for job', job.id, failed);
			job.errors.push({ message: 'SERIES_PRATEEM_ENSURE_FAILED: ' + failed.join('; ') });
		}
		return { created, existed, failed };
	}
};
