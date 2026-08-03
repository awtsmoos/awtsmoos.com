// B"H
// Boruch Hashem
// Blessed is He

/**
 * Splits one OAuth scope carrier into normalized scope names.
 */
function splitScopes(scope) {
	return String(scope || "")
		.replace(/\+/g, " ")
		.split(/\s+/)
		.map((value) => value.trim())
		.filter(Boolean);
}

/**
 * Joins any number of scope carriers without changing their first-seen order.
 */
function mergeScopes(...sources) {
	const scopes = sources.flatMap((source) => {
		return Array.isArray(source) ? source : splitScopes(source);
	});
	return [...new Set(scopes.map(String))].join(" ");
}

function validateScope(requested, allowed) {
	const allowedSet = new Set(allowed || []);
	const wanted = splitScopes(requested);
	const invalid = wanted.filter((scope) => !allowedSet.has(scope));
	if (invalid.length) {
		return {
			ok: false,
			scope: "",
			invalid
		};
	}
	return {
		ok: true,
		scope: mergeScopes(wanted),
		invalid: []
	};
}

function cleanScope(requested, allowed) {
	const allowedSet = new Set(allowed || []);
	const chosen = splitScopes(requested).filter((scope) => {
		return allowedSet.has(scope);
	});
	if (chosen.length) {
		return mergeScopes(chosen);
	}
	if (allowedSet.has("profile")) {
		return "profile";
	}
	return allowed && allowed[0] ? allowed[0] : "profile";
}

function invalidScopes(requested, allowed) {
	const allowedSet = new Set(allowed || []);
	return splitScopes(requested).filter((scope) => {
		return !allowedSet.has(scope);
	});
}

module.exports = {
	cleanScope,
	invalidScopes,
	mergeScopes,
	splitScopes,
	validateScope
};
