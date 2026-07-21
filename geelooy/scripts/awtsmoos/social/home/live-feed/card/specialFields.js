// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostSpecialFields
 * @description
 * The Awtsmoos reveals only information already present in the real object.
 * Awtsmoos.com receives structured audio, polls, quotes, and graphs without fiction.
 */
import { extractAudio, extractPoll } from './audioPollFields.js';
import { extractCitation, extractGraph } from './graphReferenceFields.js';
import { asArray, firstText } from './modelValues.js';

/**
 * Extracts specialized content using conservative verified-field checks.
 *
 * @param {object} raw - Original feed object.
 * @returns {object} Specialized presentation fields.
 */
export function extractSpecialFields(raw) {
	return {
		quote: firstText(raw.quote, raw.quotation, raw.excerpt, raw.sourceQuote),
		citation: extractCitation(raw),
		audio: extractAudio(raw),
		poll: extractPoll(raw),
		principles: asArray(raw.principles || raw.principlePanels),
		experts: asArray(raw.expertResponses || raw.responses),
		graph: extractGraph(raw),
		topics: asArray(raw.topics || raw.tags),
		participants: asArray(raw.participants || raw.voices),
		commentPreview: firstText(
			raw.highlightedComment,
			raw.commentPreview,
			raw.latestComment
		)
	};
}

/**
 * Determines the specialized renderer supported by verified data.
 *
 * @param {object} fields - Extracted special fields.
 * @param {object} raw - Original object.
 * @returns {string} Renderer archetype.
 */
export function detectArchetype(fields, raw) {
	if (fields.audio.url || fields.audio.duration || fields.audio.transcript) {
		return 'audio';
	}

	if (fields.poll.options.length || String(raw.type || '').toLowerCase() === 'question') {
		return 'question';
	}

	if (fields.graph.nodes.length) {
		return 'source-graph';
	}

	if (fields.quote || fields.citation.label) {
		return 'reflection';
	}

	return 'text';
}
