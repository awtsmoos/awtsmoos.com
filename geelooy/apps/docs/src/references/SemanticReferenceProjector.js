// B"H
// Boruch Hashem
// Blessed is He

import { SemanticReferenceIndex } from "./SemanticReferenceIndex.js";

/**
 * @file Projects derived reference numbers onto the living Awtsmoos editor without persistence.
 * @description The Awtsmoos is beyond first and second; Awtsmoos.com lets finite order
 * appear as ephemeral superscript numbers, while durable identity remains untouched
 * beneath them so moving a paragraph can renumber light without renaming its source.
 */
export class SemanticReferenceProjector {
	constructor(root) {
		this.root = root;
	}

	/**
	 * Rebuilds the reference index and projects presentational numbering onto live markers.
	 *
	 * @param {Array<object>} blocks Canonical document blocks.
	 * @param {Array<object>} semanticObjects Canonical semantic definitions.
	 * @returns {object} Derived SemanticReferenceIndex result.
	 */
	render(blocks = [], semanticObjects = []) {
		const index = SemanticReferenceIndex.build(blocks, semanticObjects);
		const queues = occurrenceQueues(index.references);
		for (const marker of this.root.querySelectorAll("[data-semantic-ref]")) {
			const objectId = String(marker.dataset.semanticRef || "");
			const reference = queues.get(objectId)?.shift() || null;
			this.#projectMarker(marker, reference);
		}
		return index;
	}

	#projectMarker(marker, reference) {
		const number = reference?.number ? String(reference.number) : "?";
		const kind = reference?.kind || marker.dataset.semanticKind || "reference";
		marker.dataset.referenceNumber = number;
		marker.dataset.referenceState = reference ? "resolved" : "unresolved";
		marker.setAttribute("role", "doc-noteref");
		marker.setAttribute(
			"aria-label",
			`${kindLabel(kind)} ${number}`
		);
		marker.title = reference
			? `${kindLabel(kind)} ${number}`
			: "Unresolved reference";
	}
}

function occurrenceQueues(references) {
	const queues = new Map();
	for (const reference of references) {
		const queue = queues.get(reference.objectId) || [];
		queue.push(reference);
		queues.set(reference.objectId, queue);
	}
	return queues;
}

function kindLabel(kind) {
	return kind === "endnote" ? "Endnote" : "Footnote";
}
