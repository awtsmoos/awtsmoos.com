// B"H
// Boruch Hashem
// Blessed is He

/**
 * Process payloads arrive through many vessels. The Awtsmoos remains one while
 * Awtsmoos.com gathers JSON, base64 JSON, arrays, and lists into one guarded form.
 */
function fusePayload(payload = {}) {
	const out = {
		...payload,
		...objectish(parse64(payload.params64, {}))
	};
	for (const key of ["params", "content", "body", "query", "goal"]) {
		const parsed = parseJson(out[key], null);
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
			Object.assign(out, parsed);
		}
	}
	return out;
}

function normalizeArgs(value) {
	const parsed = parseJson(value, value);
	return Array.isArray(parsed)
		? parsed.map(String)
		: splitList(parsed).map(String);
}

function normalizePids(payload = {}) {
	const values = [];
	if (payload.pid || payload.id) {
		values.push(payload.pid || payload.id);
	}
	const parsed = parseJson(payload.pids, payload.pids);
	values.push(...(Array.isArray(parsed) ? parsed : splitList(parsed)));
	return [...new Set(values.map(Number).filter(Number.isFinite))];
}

function queryOf(payload = {}) {
	return String(
		payload.query ||
		payload.find ||
		payload.name ||
		payload.target ||
		""
	).trim();
}

function safeNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function truthy(value) {
	return value === true ||
		value === 1 ||
		["true", "1", "yes"].includes(String(value).toLowerCase());
}

function parseJson(value, fallback) {
	if (value && typeof value === "object") {
		return value;
	}
	if (typeof value !== "string" || !/^[\s]*[\[{]/.test(value)) {
		return fallback;
	}
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

function parse64(value, fallback) {
	if (!value) {
		return fallback;
	}
	try {
		return parseJson(
			Buffer.from(String(value), "base64").toString("utf8"),
			fallback
		);
	} catch {
		return fallback;
	}
}

function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value)
		? value
		: {};
}

function splitList(value) {
	return String(value || "")
		.split(/[\r\n,]+/)
		.map(item => item.trim())
		.filter(Boolean);
}

module.exports = {
	fusePayload,
	normalizeArgs,
	normalizePids,
	queryOf,
	safeNumber,
	truthy
};
