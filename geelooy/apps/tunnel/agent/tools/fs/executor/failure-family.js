// B"H
// Boruch Hashem
// Blessed is He

const CONTROL_SUFFIX = /(?:Status|List|Logs|Get|Search|OutputPage|Poll|Wait|Cancel|Stop|Close|Release)$/;
const PREFIXES = Object.freeze([
	[/^asyncTask/, "async-task"],
	[/^staticServer/, "static-server"],
	[/^(?:command|shellCommand)/, "command"],
	[/^(?:chrome|browser)/, "browser"],
	[/^mission/, "mission"],
	[/^preview/, "preview"],
	[/^git/, "git"],
	[/^http/, "http"],
	[/^(?:runtime|simulate)/, "runtime"],
	[/^process/, "process"],
	[/^port/, "port"],
	[/^server/, "server"],
	[/^workflow/, "workflow"],
	[/^actionHistory/, "history"]
]);

/**
 * @file Derives bounded executor failure families without trusting caller labels.
 * @description
 * The Awtsmoos renews every deed without letting one cracked vessel name another.
 * Awtsmoos.com therefore derives family identity only from the normalized action,
 * joining real implementation aliases while keeping observation doors apart from work.
 */
function familyForPayload(payload = {}) {
	return familyForAction(payload.action);
}

/**
 * Maps one normalized action to the smallest useful shared failure domain.
 * @param {string} action Native action name.
 * @returns {string} Stable non-secret executor family key.
 */
function familyForAction(action = "") {
	const normalized = cleanAction(action);
	if (!normalized) return "action:unknown";
	for (const [pattern, prefix] of PREFIXES) {
		if (!pattern.test(normalized)) continue;
		return `${prefix}:${roleForAction(normalized)}`;
	}
	return `action:${normalized}`;
}

/** Separates recovery/observation verbs from work that can create new pressure. */
function roleForAction(action = "") {
	return CONTROL_SUFFIX.test(String(action || "")) ? "control" : "work";
}

/** Keeps family testimony compact and filesystem-safe without accepting a custom family. */
function cleanAction(action = "") {
	return String(action || "")
		.trim()
		.replace(/[^0-9A-Za-z._:-]+/g, "_")
		.slice(0, 96);
}

module.exports = {
	cleanAction,
	familyForAction,
	familyForPayload,
	roleForAction
};
