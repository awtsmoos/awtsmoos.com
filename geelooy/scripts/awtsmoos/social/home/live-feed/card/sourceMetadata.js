// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostSourceMetadata
 * @description
 * The Awtsmoos lets origin alter color without letting color replace meaning.
 * Awtsmoos.com receives text labels, sigils, and bounded palette names together.
 */
import { number, text } from './modelValues.js';

export function chooseSourceKind(object, raw, special) {
	const explicit = text(raw.sourceType, raw.category, raw.kind).toLowerCase();

	if (special.audio.url || explicit.includes('audio')) {
		return 'audio';
	}

	if (special.graph.nodes.length || explicit.includes('graph')) {
		return 'source-graph';
	}

	if (special.poll.options.length || explicit.includes('question')) {
		return 'question';
	}

	if (special.quote || explicit.includes('torah') || explicit.includes('source')) {
		return 'torah';
	}

	return String(object.type || 'post').toLowerCase();
}

export function sourceLabel(kind, raw) {
	return text(
		raw.sourceLabel,
		kind === 'torah' ? 'Torah source' : '',
		kind === 'audio' ? 'Audio teaching' : '',
		kind === 'question' ? 'Community question' : '',
		kind === 'source-graph' ? 'Source graph' : '',
		'Living post'
	);
}

export function sourceColor(kind) {
	if (kind === 'audio') {
		return 'magenta';
	}

	if (kind === 'source-graph') {
		return 'violet';
	}

	return 'cyan';
}

export function sourceIcon(kind) {
	const icons = {
		torah: 'א',
		audio: '◉',
		question: '?',
		'source-graph': '◇'
	};

	return icons[kind] || '✦';
}

export function interactionCounts(raw) {
	return {
		appreciations: number(raw.appreciations, raw.likes, raw.reactions),
		discussions: number(raw.discussions, raw.comments, raw.commentCount),
		references: number(raw.references, raw.referenceCount),
		participants: number(raw.participantCount, raw.participants?.length)
	};
}
