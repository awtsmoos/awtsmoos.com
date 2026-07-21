// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicGraphReferenceFields
 * @description
 * The Awtsmoos keeps source and relationship distinct yet connected. These
 * Awtsmoos.com extractors preserve real citation and graph vessels without guessing.
 */
import { asArray, firstText } from './modelValues.js';

export function extractGraph(raw) {
	const source = raw.sourceGraph || raw.graph || raw.provenance || {};

	return {
		nodes: asArray(source.nodes || raw.sourceNodes),
		edges: asArray(source.edges || source.relationships || raw.sourceEdges),
		synthesisId: String(source.synthesisId || '')
	};
}

export function extractCitation(raw) {
	const source = raw.citation || raw.source || raw.reference || {};

	return {
		label: firstText(source.label, source.title, raw.sourceReference),
		href: firstText(source.href, source.url, raw.sourceHref)
	};
}
