// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_MIN_AGE_MS = 30 * 60 * 1000;

/**
 * @file Plans reversible retirement of historical paired mailbox testimony.
 * @description The Awtsmoos distinguishes old settled testimony from living work;
 * Awtsmoos.com never replays or acknowledges a legacy pair merely to make health look green.
 */
function plan(evidence = {}, options = {}) {
	const now = Number(options.now || Date.now());
	const minAgeMs = boundedAge(options.minAgeMs);
	const inbox = indexById(evidence.inbox || []);
	const outbox = indexById(evidence.outbox || []);
	const candidates = [];
	for (const [id, input] of inbox.entries()) {
		const output = outbox.get(id);
		if (!output || !eligiblePair(input, output, now, minAgeMs)) continue;
		candidates.push({
			id,
			inboxUpdatedAt: input.updatedAt,
			outboxUpdatedAt: output.updatedAt,
			outboxType: output.value.type
		});
	}
	return {
		ok: true,
		dryRun: true,
		minAgeMs,
		plannedAt: new Date(now).toISOString(),
		candidates
	};
}

function eligiblePair(input, output, now, minAgeMs) {
	if (!input?.value || !output?.value) return false;
	if (String(output.value.type || "") !== "TUNNEL_RESPONSE") return false;
	if (String(output.value.originRegistrationKey || "").trim()) return false;
	if (!oldEnough(input.updatedAt, now, minAgeMs)) return false;
	if (!oldEnough(output.updatedAt, now, minAgeMs)) return false;
	const responseId = output.value.transportReceiptId || output.value.controlRequestId || output.value.id;
	return String(responseId || "") === String(output.id || "");
}

function indexById(entries) {
	const result = new Map();
	for (const entry of entries) {
		const id = String(entry?.id || "").trim();
		if (id) result.set(id, entry);
	}
	return result;
}

function oldEnough(value, now, minAgeMs) {
	const parsed = Date.parse(String(value || ""));
	return Number.isFinite(parsed) && now - parsed >= minAgeMs;
}

function boundedAge(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 60000) return DEFAULT_MIN_AGE_MS;
	return Math.min(number, 30 * 24 * 60 * 60 * 1000);
}

module.exports = { DEFAULT_MIN_AGE_MS, boundedAge, eligiblePair, plan };
