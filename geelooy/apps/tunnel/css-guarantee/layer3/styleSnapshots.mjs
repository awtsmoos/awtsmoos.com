//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 10 style snapshots for the Airtight CSS Guarantee System.
 * @description Post-deploy computed-style regression guard: capture a normalized
 * snapshot of the computed styles that matter (color, background, font size,
 * display) for the guarantee's selectors, then diff a fresh snapshot against the
 * recorded one. Any change the pipeline did not allowlist is significant.
 *
 * All functions here are pure — no browser, no DOM, no I/O. The pipeline (or a
 * headless-Chrome harness) supplies `computedStyles`; these functions only
 * normalize, compare, and judge. Fully testable with node:test.
 */

/** Snapshot format version. Bump when the snapshot shape changes. */
export const SNAPSHOT_VERSION = 1;

/**
 * Return a shallow copy of `obj` with keys in sorted (code-unit) order.
 * Used for deterministic JSON: same logical content always stringifies the same.
 * @param {object} obj
 * @returns {object}
 */
function sortedKeysCopy(obj) {
	const out = {};
	for (const key of Object.keys(obj).sort()) {
		out[key] = obj[key];
	}
	return out;
}

/**
 * Capture a normalized snapshot of computed styles.
 *
 * @param {Array<{selector: string, styles: object}>} computedStyles
 *   One entry per selector; styles may carry color, backgroundColor, fontSize,
 *   display (extra properties are kept as-is). When the same selector appears
 *   more than once, later entries merge over earlier ones.
 * @returns {{version: number, capturedAt: string, entries: Record<string, object>}}
 *   JSON-serializable snapshot: selectors inserted in sorted order, each style
 *   object's keys in sorted order, so identical inputs always produce identical
 *   JSON.stringify output.
 * @throws {TypeError} When computedStyles is not an array or a selector is invalid.
 */
export function captureSnapshot(computedStyles) {
	if (!Array.isArray(computedStyles)) {
		throw new TypeError("captureSnapshot: computedStyles must be an array of {selector, styles}.");
	}
	const merged = {};
	for (const entry of computedStyles) {
		const selector = entry && entry.selector;
		if (typeof selector !== "string" || selector.length === 0) {
			throw new TypeError("captureSnapshot: every entry needs a non-empty string selector.");
		}
		const styles =
			entry.styles && typeof entry.styles === "object" ? entry.styles : {};
		merged[selector] = { ...(merged[selector] ?? {}), ...styles };
	}
	const entries = {};
	for (const selector of Object.keys(merged).sort()) {
		entries[selector] = sortedKeysCopy(merged[selector]);
	}
	return {
		version: SNAPSHOT_VERSION,
		capturedAt: new Date().toISOString(),
		entries
	};
}

/**
 * Diff two snapshots.
 *
 * @param {{entries?: Record<string, object>}} oldSnap The recorded (baseline) snapshot.
 * @param {{entries?: Record<string, object>}} newSnap The fresh snapshot.
 * @returns {{
 *   changed: Array<{selector: string, property: string, oldValue: *, newValue: *}>,
 *   added: Array<string>,
 *   removed: Array<string>
 * }}
 *   `changed` holds one entry per (selector, property) whose value differs
 *   (sorted by selector, then property); `added`/`removed` list selectors
 *   present in only one snapshot (sorted). Missing snapshots are treated as
 *   empty, so a diff against nothing reports everything as added.
 */
export function diffSnapshots(oldSnap, newSnap) {
	const oldEntries =
		oldSnap && oldSnap.entries && typeof oldSnap.entries === "object"
			? oldSnap.entries
			: {};
	const newEntries =
		newSnap && newSnap.entries && typeof newSnap.entries === "object"
			? newSnap.entries
			: {};

	const changed = [];
	const added = [];
	const removed = [];

	for (const selector of Object.keys(newEntries).sort()) {
		if (!Object.hasOwn(oldEntries, selector)) {
			added.push(selector);
			continue;
		}
		const oldStyles = oldEntries[selector] ?? {};
		const newStyles = newEntries[selector] ?? {};
		const properties = new Set([
			...Object.keys(oldStyles),
			...Object.keys(newStyles)
		]);
		for (const property of [...properties].sort()) {
			const oldValue = oldStyles[property];
			const newValue = newStyles[property];
			if (!Object.is(oldValue, newValue)) {
				changed.push({ selector, property, oldValue, newValue });
			}
		}
	}
	for (const selector of Object.keys(oldEntries).sort()) {
		if (!Object.hasOwn(newEntries, selector)) {
			removed.push(selector);
		}
	}

	return { changed, added, removed };
}

/**
 * Judge whether a diff is significant.
 *
 * Significant = at least one `changed` entry whose property is NOT in
 * `ignoreList`. This lets the pipeline allowlist expected changes (e.g. an
 * intentional color tweak) while still failing on surprises.
 *
 * Note: added/removed selectors are reported by `diffSnapshots` but do NOT
 * count as "significant" here — the pipeline decides separately how to treat
 * a selector appearing or disappearing.
 *
 * @param {{changed?: Array<{property: string}>}} diff A diffSnapshots result.
 * @param {Array<string>} [ignoreList=[]] Property names to allowlist.
 * @returns {boolean}
 */
export function isSignificantChange(diff, ignoreList = []) {
	const ignored = new Set(ignoreList ?? []);
	const changed = (diff && Array.isArray(diff.changed) ? diff.changed : []);
	return changed.some((entry) => !ignored.has(entry.property));
}
