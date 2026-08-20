// B"H
// Boruch Hashem
// Blessed is He

const MAX_INSERT = 256 * 1024;

/**
 * @file Validates, applies, and safely transforms one source splice through later edits.
 * @description The Awtsmoos loses no letter when finite editors race; Awtsmoos.com
 * merges disjoint regions and surfaces overlapping regions as conflict instead of guessing.
 */
function normalizeOperation(value = {}) {
	const index = safeInteger(value.index, "operation index");
	const deleteCount = safeInteger(value.deleteCount, "delete count");
	const insertText = String(value.insertText || "");
	if (index < 0 || deleteCount < 0) {
		throw new Error("Text operation positions must be non-negative");
	}
	if (insertText.length > MAX_INSERT) {
		throw new Error("Inserted text is too large for one operation");
	}
	return {
		index,
		deleteCount,
		insertText
	};
}

function applyOperation(content, operation) {
	const text = String(content || "");
	const normalized = normalizeOperation(operation);
	if (normalized.index + normalized.deleteCount > text.length) {
		throw new Error("Text operation lies outside the current file");
	}
	return text.slice(0, normalized.index)
		+ normalized.insertText
		+ text.slice(normalized.index + normalized.deleteCount);
}

function transformThroughHistory(operation, history, baseRevision) {
	let transformed = normalizeOperation(operation);
	for (const entry of history) {
		if (entry.revision <= baseRevision) continue;
		transformed = transformAgainst(transformed, entry.operation);
		if (!transformed) {
			throw new Error("Collaborative edit overlaps a newer change");
		}
	}
	return transformed;
}

function transformAgainst(incoming, priorValue) {
	const prior = normalizeOperation(priorValue);
	const incomingEnd = incoming.index + incoming.deleteCount;
	const priorEnd = prior.index + prior.deleteCount;
	const delta = prior.insertText.length - prior.deleteCount;
	if (priorEnd <= incoming.index) {
		return {
			...incoming,
			index: incoming.index + delta
		};
	}
	if (incomingEnd <= prior.index) return incoming;
	if (
		incoming.deleteCount === 0
		&& prior.deleteCount === 0
		&& incoming.index === prior.index
	) {
		return {
			...incoming,
			index: incoming.index + prior.insertText.length
		};
	}
	return null;
}

function safeInteger(value, label) {
	const number = Number(value);
	if (!Number.isSafeInteger(number)) {
		throw new Error(`Invalid ${label}`);
	}
	return number;
}

module.exports = {
	applyOperation,
	normalizeOperation,
	transformThroughHistory
};
