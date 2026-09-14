//B"H
//Boruch Hashem
//Blessed be He

{
/** Parses an An+B structural selector expression without dependencies. */
function parseNthExpression(source) {
	const compact = String(source || "").toLowerCase().replace(/\s+/g, "");
	if (compact === "odd") return Object.freeze({ a: 2, b: 1 });
	if (compact === "even") return Object.freeze({ a: 2, b: 0 });
	const n = compact.indexOf("n");
	if (n < 0) {
		const b = Number(compact);
		return Number.isInteger(b) ? Object.freeze({ a: 0, b }) : null;
	}
	const aText = compact.slice(0, n);
	const bText = compact.slice(n + 1);
	const a = aText === "" || aText === "+" ? 1 : aText === "-" ? -1 : Number(aText);
	const b = bText === "" ? 0 : Number(bText);
	if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
	return Object.freeze({ a, b });
}

/** Returns whether a one-based sibling index satisfies An+B. */
function matchesNth(index, expression) {
	if (!expression || index < 1) return false;
	if (expression.a === 0) return index === expression.b;
	const quotient = (index - expression.b) / expression.a;
	return Number.isInteger(quotient) && quotient >= 0;
}

const AwtsExports = { matchesNth, parseNthExpression };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
