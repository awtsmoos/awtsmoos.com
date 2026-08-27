// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tracks aggregate request-consumer stages inside the execution parent.
 * @description
 * The Awtsmoos knows each deed without exposing its private face. Awtsmoos.com
 * stores request IDs only in parent memory and publishes aggregate age/count truth,
 * so a child can detect work that never reached a real handler or worker assignment.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const active = new Map();

	function begin(id, lane, startedAt = now()) {
		const key = String(id || "");
		if (!key) return false;
		active.set(key, {
			lane: String(lane || ""),
			startedAt,
			updatedAt: startedAt,
			phase: "lane_dequeued",
			consumerStarted: false
		});
		return true;
	}

	function mark(id, phase, details = {}) {
		const key = String(id || "");
		const current = active.get(key);
		if (!current) return false;
		current.updatedAt = now();
		current.phase = String(phase || current.phase);
		current.consumerStarted ||= details.consumerStarted === true;
		return true;
	}

	function finish(id) {
		return active.delete(String(id || ""));
	}

	function snapshot(observedAt = now()) {
		let waitingForConsumer = 0;
		let oldestUnstartedAgeMs = 0;
		let consumerStarted = 0;
		const phases = {};
		for (const entry of active.values()) {
			phases[entry.phase] = Number(phases[entry.phase] || 0) + 1;
			if (entry.consumerStarted) {
				consumerStarted += 1;
				continue;
			}
			waitingForConsumer += 1;
			oldestUnstartedAgeMs = Math.max(
				oldestUnstartedAgeMs,
				Math.max(0, observedAt - entry.startedAt)
			);
		}
		return {
			active: active.size,
			consumerStarted,
			waitingForConsumer,
			oldestUnstartedAgeMs,
			phases
		};
	}

	return {
		begin,
		finish,
		mark,
		snapshot
	};
}

module.exports = { create };
