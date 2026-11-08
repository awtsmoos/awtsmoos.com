//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobLiveHashPrep.js
 * @description
 * The Awtsmoos reveals indexed hints without making an optimization into a prison;
 * Awtsmoos.com abandons a stuck cache prepass softly, then asks native truth per post with precision.
 *
 * Bulk-upload redesign §3.3/§3.6 + Nov 8 instant pass: the live-hash
 * prepass is an OPTIMIZATION, never a gate. It used to be awaited before
 * the first post was written — and in production (AwtsmoosDB mode) the
 * builder is a SYNCHRONOUS loop of one point lookup per post with no
 * yields, so a 10,000-post job paid 10,000 sync store reads (event loop
 * blocked, web traffic stalled) before post #1, and the 480 s soft
 * deadline could not fire mid-loop at all. Now the prepass runs in the
 * BACKGROUND, filling the shared Map slice by slice with a setImmediate
 * breath between slices, while the workers start immediately. A worker
 * whose post is not in the cache yet resolves the miss against the
 * native record (the existing v4 fallback in processOneWrite), so
 * correctness never depends on the prepass.
 *
 * MERGE INVARIANT (the background prepass must never clobber a worker):
 * the prepass only sets a key that is ABSENT. Workers set a key right
 * after they write its post, so a worker's fresh value always wins over
 * a prepass value read from an older live record. A stale prepass value
 * can only ever cause a redundant re-write, never a wrong skip.
 */

const LIVE_HASH_PREP_LIMIT_MS = Math.max(
	30000,
	Number(process.env.AWTSMOOS_LIVE_HASH_PREP_MS) || 480000
);

// One prepass slice: bounded sync work per macrotask in AwtsmoosDB mode
// (250 point lookups), then a setImmediate breath so the event loop and
// the workers stay live.
const LIVE_HASH_PREP_SLICE_SIZE = 250;

/** Resolve a promise before a soft deadline or reject only the optional optimization. */
function withSoftDeadline(promise, milliseconds) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('LIVE_HASH_PREP_SOFT_TIMEOUT'));
		}, milliseconds);
		Promise.resolve(promise).then(
			value => {
				clearTimeout(timer);
				resolve(value);
			},
			error => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

/** One setImmediate breath (the prepass never blocks the loop for a whole slice). */
function prepYield() {
	return new Promise(resolve => setImmediate(resolve));
}

/**
 * Start the live-hash prepass in the BACKGROUND and return immediately.
 * @returns {{ liveHashes: Map, done: Promise<{size:number, ms:number, abandoned:boolean}> }}
 * `liveHashes` is the shared Map the workers read; it fills slice by
 * slice. `done` resolves when the prepass finishes, abandons on its
 * deadline, or stops because the job ended — it never rejects.
 * `overrides.deadlineMs` caps the prepass (tests use a short one; the
 * default is LIVE_HASH_PREP_LIMIT_MS).
 */
function startLiveHashPrep(routes, $i, job, overrides = {}) {
	const liveHashes = new Map();
	const startedAt = Date.now();
	const deadlineMs = Number(overrides.deadlineMs) > 0 ? Number(overrides.deadlineMs) : LIVE_HASH_PREP_LIMIT_MS;
	if (!job || job.skipLiveCheck) {
		job.cacheBuildMs = 0;
		return { liveHashes, done: Promise.resolve({ size: 0, ms: 0, abandoned: false }) };
	}
	if (typeof routes.buildLiveHashCacheForPostsAsync !== 'function') {
		job.errors.push({ message: 'LIVE_CACHE_FAILED: ASYNC_LIVE_HASH_BUILDER_REQUIRED' });
		job.cacheBuildMs = Date.now() - startedAt;
		return { liveHashes, done: Promise.resolve({ size: 0, ms: job.cacheBuildMs, abandoned: true }) };
	}
	const postIds = [...new Set(
		((job.spec && job.spec.posts) || [])
			.map(post => post && post.postId)
			.filter(Boolean)
	)];
	const done = (async () => {
		let abandoned = false;
		try {
			for (let start = 0; start < postIds.length; start += LIVE_HASH_PREP_SLICE_SIZE) {
				// Stop when the job is over (workers done) or the deadline passed:
				// the cache is an optimization, and a dead job needs none of it.
				if (job.status && job.status !== 'running' && job.status !== 'queued') { abandoned = true; break; }
				if (Date.now() - startedAt > deadlineMs) { abandoned = true; break; }
				const slice = postIds.slice(start, start + LIVE_HASH_PREP_SLICE_SIZE);
				let partial;
				try {
					partial = await routes.buildLiveHashCacheForPostsAsync($i, job.spec.heichelId, slice);
				} catch (error) {
					job.errors.push({ message: 'LIVE_CACHE_FAILED: ' + (error?.message || error) });
					abandoned = true;
					break;
				}
				if (partial && typeof partial.forEach === 'function') {
					// Merge invariant: only fill ABSENT keys — a worker's
					// fresh value (set right after its write) always wins.
					partial.forEach((hash, postId) => {
						if (!liveHashes.has(postId)) liveHashes.set(postId, hash);
					});
				}
				await prepYield();
			}
		} catch (error) {
			job.errors.push({ message: 'LIVE_CACHE_FAILED: ' + (error?.message || error) });
			abandoned = true;
		}
		job.cacheBuildMs = Date.now() - startedAt;
		return { size: liveHashes.size, ms: job.cacheBuildMs, abandoned };
	})();
	return { liveHashes, done };
}

/**
 * Build the partial live-hash cache through the asynchronous indexed path only.
 * An empty partial cache is safe because the write phase probes native truth on misses.
 * Awaited variant (kept for callers that need a completed cache): it runs the
 * same chunked background fill and awaits it, so it yields between slices
 * instead of blocking the loop on one synchronous pass.
 */
async function prepareLiveHashes(routes, $i, job) {
	const started = startLiveHashPrep(routes, $i, job);
	await started.done;
	return started.liveHashes;
}

module.exports = {
	LIVE_HASH_PREP_LIMIT_MS,
	LIVE_HASH_PREP_SLICE_SIZE,
	prepareLiveHashes,
	startLiveHashPrep,
	withSoftDeadline
};
