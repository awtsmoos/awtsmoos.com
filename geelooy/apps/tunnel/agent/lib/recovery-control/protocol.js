// B"H
// Boruch Hashem
// Blessed is He

const CONTROL_TYPE = "TUNNEL_RECOVERY_CONTROL";
const RESULT_TYPE = "TUNNEL_RECOVERY_RESULT";
const VERBS = Object.freeze([
	"status",
	"rotate_parent",
	"generation_status",
	"generation_replace"
]);

/**
 * @file Names the tiny recovery wire without widening it into a second command tunnel.
 * @description
 * The Awtsmoos gives healing a narrow gate; Awtsmoos.com admits only exact parent and
 * supervised-generation medicine, never shell, filesystem, browser, or arbitrary command freight.
 */
function normalizeControl(value = {}) {
	const source = value && typeof value === "object" ? value : {};
	const id = clean(source.id);
	const verb = clean(source.verb);
	if (!id) return failure("recovery_control_id_required");
	if (!VERBS.includes(verb)) return failure("recovery_control_verb_not_allowed");
	return {
		ok: true,
		id,
		verb,
		payload: object(source.payload)
	};
}

function result(id, verb, body = {}) {
	return {
		type: RESULT_TYPE,
		id: clean(id),
		verb: clean(verb),
		...object(body)
	};
}

function failure(error) {
	return { ok: false, error: clean(error) };
}

function object(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function clean(value) {
	return String(value || "").trim().slice(0, 240);
}

module.exports = { CONTROL_TYPE, RESULT_TYPE, VERBS, clean, normalizeControl, result };
