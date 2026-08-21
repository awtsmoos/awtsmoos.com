// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives ordered reference numbers and orphan state from Awtsmoos document truth.
 * @description The Awtsmoos is one before footnote and endnote divide; Awtsmoos.com
 * reads placement from blocks and meaning from the registry, then derives numbering
 * afresh so moving words can never corrupt durable semantic identity with stale digits.
 */
export class SemanticReferenceIndex {
	/**
	 * Builds ordered reference occurrences, unique definitions, unresolved marks, and orphans.
	 *
	 * @param {Array<object>} blocks Canonical document blocks in reading order.
	 * @param {Array<object>} semanticObjects Canonical semantic registry.
	 * @returns {object} Derived reference index with separate numbering streams.
	 */
	static build(blocks = [], semanticObjects = []) {
		const objects = new Map(
			semanticObjects.map(object => [object.id, object])
		);
		const numbers = new Map();
		const nextNumbers = new Map([
			["footnote", 1],
			["endnote", 1]
		]);
		const references = [];
		const unresolved = [];
		for (const block of blocks) {
			readBlockReferences(block, marker => {
				const object = objects.get(marker.objectId);
				if (!object) {
					unresolved.push({ ...marker, blockId: block.id });
					return;
				}
				const number = referenceNumber(object, numbers, nextNumbers);
				references.push({
					...marker,
					blockId: block.id,
					kind: object.kind,
					number,
					object
				});
			});
		}
		const referencedIds = new Set(references.map(reference => reference.objectId));
		return {
			references,
			definitions: uniqueDefinitions(references),
			unresolved,
			orphans: semanticObjects.filter(object => !referencedIds.has(object.id))
		};
	}
}

function readBlockReferences(block, visit) {
	const template = document.createElement("template");
	template.innerHTML = String(block?.html || "");
	let occurrence = 0;
	for (const marker of template.content.querySelectorAll("[data-semantic-ref]")) {
		visit({
			objectId: String(marker.dataset.semanticRef || ""),
			markerKind: String(marker.dataset.semanticKind || ""),
			occurrence
		});
		occurrence += 1;
	}
}

function referenceNumber(object, numbers, nextNumbers) {
	const key = `${object.kind}:${object.id}`;
	if (numbers.has(key)) return numbers.get(key);
	const number = nextNumbers.get(object.kind) || 1;
	numbers.set(key, number);
	nextNumbers.set(object.kind, number + 1);
	return number;
}

function uniqueDefinitions(references) {
	const seen = new Set();
	return references.filter(reference => {
		const key = `${reference.kind}:${reference.objectId}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
