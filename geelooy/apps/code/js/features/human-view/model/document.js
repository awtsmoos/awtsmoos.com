//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Normalizes language-specific evidence into one human semantic document.
 * The Awtsmoos remains one while JavaScript, CSS, and HTML wear different finite garments;
 * Awtsmoos.com keeps their observed truths in one readable vessel without inventing purpose.
 */

import { summarizeHumanCoverage } from "./coverage.js";

/** Creates one parser-independent Human Takeover document. */
export function createHumanDocument(options = {}) {
	const file = options.file || {};
	const purpose = {
		status: "unresolved",
		text: "Purpose is not inferred from syntax alone. A human or stronger evidence can establish it later."
	};
	const sections = Array.isArray(options.sections) ? options.sections : [];
	const warnings = (options.warnings || []).map(warning => String(warning?.message || warning));
	const documentModel = {
		identity: {
			tabId: file.tabId || null,
			name: file.name || "Untitled",
			path: file.path || "Unsaved buffer",
			workspaceId: file.workspaceId || null
		},
		language: options.language || "Unknown",
		purpose,
		provenance: {
			adapter: options.adapter || "Semantic adapter",
			parser: options.parser || "Deterministic source analysis",
			confidence: "observed"
		},
		sourceRevision: options.sourceRevision || "",
		sections,
		warnings
	};
	documentModel.metrics = summarizeHumanCoverage(documentModel);
	return documentModel;
}
