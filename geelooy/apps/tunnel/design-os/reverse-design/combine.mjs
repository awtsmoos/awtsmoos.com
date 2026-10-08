//B"H
/**
 * @file Priority merge for constraint-DSL sources.
 * @description When several emotion bundles (and the content base) are combined,
 * `=` assignments conflict. Merge rule, verified against the solver's own
 * semantics ("first '=' wins; validator caught conflicts"):
 *
 *   1. Sources are processed in priority order (highest first).
 *   2. The first `=`/`==` on a dotted path wins; later ones are skipped with
 *      a note — never silently.
 *   3. Inequalities (`>=`, `<=`, `in`, call-subject checks like contrast())
 *      always compose: the solver requires every one to hold, so combining
 *      keeps the strictest bound automatically.
 *   4. If the merged program is unsatisfiable (e.g. urgency's
 *      `whitespace.ratio <= 0.25` against calm's `whitespace.ratio >= 0.45`),
 *      solve fails honestly with the solver's own error — the notes explain why.
 */

import { parse, astToString } from "../constraints/parser.mjs";

/** Dotted-path key for an `=` statement, or null for non-assignments. */
function assignKey(stmt) {
	if (stmt.op !== "=" && stmt.op !== "==") return null;
	const t = stmt.target;
	if (!t) return null;
	const parts = Array.isArray(t) ? t : t.parts;
	if (!parts) return null;
	return parts.join(".");
}

/**
 * Merge sources in priority order.
 * @param {Array<{label:string, source:string}>} namedSources Highest priority first.
 * @returns {{source:string, notes:Array<string>}}
 */
export function combineSources(namedSources) {
	const seen = new Set();
	const kept = [];
	const notes = [];
	for (const { label, source } of namedSources) {
		let ast;
		try {
			ast = parse(source);
		} catch (e) {
			notes.push(`${label}: parse failed, source skipped — ${e.message}`);
			continue;
		}
		for (const stmt of ast.statements) {
			const key = assignKey(stmt);
			if (key) {
				if (seen.has(key)) {
					notes.push(
						`${label}: '${key}' already set by a higher-priority source — skipped`
					);
					continue;
				}
				seen.add(key);
			}
			kept.push(stmt);
		}
	}
	const program = { type: "program", statements: kept };
	return { source: astToString(program), notes };
}
