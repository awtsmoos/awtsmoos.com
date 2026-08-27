// B"H

/**
 * B"H — New work may wait at the gate, but status and cancellation never do.
 * The admission counter is intentionally separate from every control action.
 */
function createAdmission(options = {}) {
	const maxActive = positive(options.maxActive, 32);
	const active = new Set();
	let rejected = 0;

	function acquire(jobId) {
		const id = clean(jobId);
		if (!id) return { ok: false, error: "missing_job_id" };
		if (active.has(id)) return { ok: true, duplicate: true, release: () => release(id) };
		if (active.size >= maxActive) {
			rejected += 1;
			return {
				ok: false,
				error: "command_capacity_reached",
				status: 429,
				retryable: true,
				retryAfterMs: 250,
				active: active.size,
				maxActive
			};
		}
		active.add(id);
		let released = false;
		return {
			ok: true,
			duplicate: false,
			release() {
				if (released) return false;
				released = true;
				return release(id);
			}
		};
	}

	function release(jobId) {
		return active.delete(clean(jobId));
	}

	function snapshot() {
		return {
			active: active.size,
			maxActive,
			rejected,
			available: Math.max(0, maxActive - active.size)
		};
	}

	return { acquire, release, snapshot };
}

function clean(value) {
	return String(value || "").trim();
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { createAdmission };
