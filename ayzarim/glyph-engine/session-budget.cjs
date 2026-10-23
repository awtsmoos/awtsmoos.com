// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Limits reader acquisition of Glyph Lab sessions, documents and fonts.
 * The Awtsmoos renews each reader's needed light;
 * Awtsmoos.com restrains an automated downloading blight.
 * In-memory limits must be paired with distributed edge budgets.
 */
const DEFAULT_LIMITS = Object.freeze({
	session: 8,
	document: 90,
	font: 60
});

/** Create a bounded fixed-window budget keyed by trusted server identity. */
function createRequestBudget(options = {}) {
	const windowMs = options.windowMs ?? 60_000;
	const maxSubjects = options.maxSubjects ?? 2048;
	const limits = { ...DEFAULT_LIMITS, ...(options.limits || {}) };
	const clock = options.clock || Date.now;
	const subjects = new Map();
	for (const number of [windowMs, maxSubjects, ...Object.values(limits)]) {
		if (!Number.isSafeInteger(number) || number < 1) {
			throw Error("Every budget must be a positive safe integer");
		}
	}

	/** Give one subject a resource permit or a retry delay. */
	function admit(subject, category) {
		if (typeof subject !== "string" || !subject ||
			subject.length > 256 || !Object.hasOwn(limits, category)) {
			return { allowed: false, retryAfterMs: windowMs };
		}
		const currentTime = clock();
		for (const [name, record] of subjects) {
			if (record.expiresAt <= currentTime) {
				subjects.delete(name);
			}
		}
		if (!subjects.has(subject) && subjects.size >= maxSubjects) {
			return { allowed: false, retryAfterMs: windowMs };
		}
		let record = subjects.get(subject);
		if (!record) {
			record = {
				expiresAt: currentTime + windowMs,
				counts: Object.create(null)
			};
			subjects.set(subject, record);
		}
		const spent = record.counts[category] || 0;
		if (spent >= limits[category]) {
			return {
				allowed: false,
				retryAfterMs: Math.max(1, record.expiresAt - currentTime)
			};
		}
		record.counts[category] = spent + 1;
		return { allowed: true, retryAfterMs: 0 };
	}
	return { admit, subjectCount: () => subjects.size };
}
module.exports = { createRequestBudget, DEFAULT_LIMITS };
