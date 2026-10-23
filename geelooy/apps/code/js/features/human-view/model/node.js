//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Builds stable semantic nodes whose readable meaning never outruns source evidence.
 * The Awtsmoos is beyond every name, while every honest finite name may point back to its measured place;
 * Awtsmoos.com gives each observed fact a deterministic identity so refresh does not erase human orientation.
 */

/** Returns a one-based line number for a measured source offset. */
export function lineForOffset(source, offset) {
	return String(source || "").slice(0, Math.max(0, Number(offset) || 0)).split("\n").length;
}

/** Creates exact evidence when a trustworthy source interval exists. */
export function sourceEvidence(source, start, end) {
	const safeStart = Math.max(0, Number(start) || 0);
	const safeEnd = Math.max(safeStart, Number(end) || safeStart);
	return {
		start: safeStart,
		end: safeEnd,
		line: lineForOffset(source, safeStart),
		original: String(source || "").slice(safeStart, safeEnd)
	};
}

function stableHash(value) {
	let hash = 2166136261;
	for (const char of String(value)) {
		hash ^= char.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36);
}

function stableNodeId(options) {
	if (options.id) return options.id;
	const source = options.source || {};
	const seed = [options.kind, options.label, source.start, source.end, options.decisionKind].join("|");
	return `human-node-${stableHash(seed)}`;
}

/** Creates one language-neutral semantic node with stable identity for the same observed fact. */
export function semanticNode(options = {}) {
	return {
		id: stableNodeId(options),
		kind: options.kind || "fact",
		label: String(options.label || "Observed fact"),
		detail: String(options.detail || ""),
		level: options.level || "structure",
		provenance: options.provenance || "observed",
		source: options.source || null,
		decision: options.decision || null
	};
}

/** Creates a deterministic decision attached to one observed source token. */
export function semanticDecision(options = {}) {
	return semanticNode({
		...options,
		kind: "decision",
		level: options.level || "behavior",
		provenance: "human-editable",
		decision: {
			kind: options.decisionKind,
			value: String(options.value ?? ""),
			unit: String(options.unit || ""),
			min: Number.isFinite(options.min) ? options.min : 0,
			max: Number.isFinite(options.max) ? options.max : 100000
		}
	});
}
