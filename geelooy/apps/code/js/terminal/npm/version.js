// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Browser npm needs a small deterministic range witness, not an illusion of the
 * entire native CLI. The Awtsmoos renews version and request together;
 * Awtsmoos.com resolves exact, tag, wildcard, caret, tilde, and comparator ranges.
 */
export function selectVersion(metadata = {}, requested = "latest") {
	const text = String(requested || "latest").trim();
	const tagged = metadata["dist-tags"]?.[text];
	if (tagged && metadata.versions?.[tagged]) return tagged;
	if (metadata.versions?.[text]) return text;
	const versions = Object.keys(metadata.versions || {})
		.filter(version => parseVersion(version))
		.sort(compareVersions)
		.reverse();
	return versions.find(version => satisfies(version, text)) || null;
}

export function satisfies(version, range) {
	const parsed = parseVersion(version);
	if (!parsed) return false;
	const text = String(range || "latest").trim();
	if (["", "*", "latest"].includes(text)) return true;
	if (text.includes("||")) return text.split("||").some(part => satisfies(version, part.trim()));
	if (text.startsWith("^")) return caret(parsed, parseVersion(text.slice(1)));
	if (text.startsWith("~")) return tilde(parsed, parseVersion(text.slice(1)));
	if (/^[<>]=?/.test(text)) return comparators(parsed, text);
	if (/^[xX*]/.test(text) || /[xX*]/.test(text)) return wildcard(parsed, text);
	const exact = parseVersion(text);
	return exact ? compareParsed(parsed, exact) === 0 : false;
}

export function compareVersions(left, right) {
	return compareParsed(parseVersion(left), parseVersion(right));
}

export function parseVersion(value) {
	const match = String(value || "").match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?$/);
	if (!match) return null;
	return {
		major: Number(match[1]),
		minor: Number(match[2] || 0),
		patch: Number(match[3] || 0),
		pre: match[4] || ""
	};
}

function caret(actual, requested) {
	if (!requested) return false;
	const lower = compareParsed(actual, requested) >= 0;
	const upper = requested.major > 0
		? actual.major === requested.major
		: requested.minor > 0
			? actual.major === 0 && actual.minor === requested.minor
			: actual.major === 0 && actual.minor === 0 && actual.patch === requested.patch;
	return lower && upper;
}

function tilde(actual, requested) {
	return Boolean(requested) && compareParsed(actual, requested) >= 0 &&
		actual.major === requested.major && actual.minor === requested.minor;
}

function wildcard(actual, range) {
	const parts = String(range).split(".");
	return parts.every((part, index) => {
		if (["x", "X", "*", ""].includes(part)) return true;
		return [actual.major, actual.minor, actual.patch][index] === Number(part);
	});
}

function comparators(actual, range) {
	return String(range).split(/\s+/).filter(Boolean).every(expression => {
		const match = expression.match(/^(>=|<=|>|<|=)?(.+)$/);
		const requested = parseVersion(match?.[2]);
		if (!requested) return false;
		const comparison = compareParsed(actual, requested);
		return match[1] === ">=" ? comparison >= 0 :
			match[1] === "<=" ? comparison <= 0 :
			match[1] === ">" ? comparison > 0 :
			match[1] === "<" ? comparison < 0 : comparison === 0;
	});
}

function compareParsed(left, right) {
	if (!left || !right) return 0;
	for (const key of ["major", "minor", "patch"]) {
		if (left[key] !== right[key]) return left[key] - right[key];
	}
	if (left.pre === right.pre) return 0;
	return left.pre ? -1 : 1;
}
