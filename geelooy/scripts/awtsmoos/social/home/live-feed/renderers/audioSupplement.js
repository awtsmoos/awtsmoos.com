// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioSupplement
 * @description
 * The Awtsmoos keeps transcript, topics, and discussion beside sound but not
 * inside it. Awtsmoos.com remains understandable when audio cannot play.
 */
import { createElement } from '../card/domFactory.js';

export function renderAudioTopics(model) {
	const row = createElement('div', 'post-topic-chips');

	model.special.topics.slice(0, 6).forEach(topic => {
		const label = typeof topic === 'string' ? topic : topic.label || topic.name;

		if (label) {
			row.append(createElement('span', 'post-topic-chip', {}, label));
		}
	});

	return row;
}

export function renderAudioTranscript(model) {
	const details = createElement('details', 'audio-transcript');
	const summary = createElement('summary', '', {}, 'Transcript');
	const transcript = model.special.audio.transcript
		|| 'No transcript was supplied with this audio.';

	details.append(summary, createElement('p', '', {}, transcript));
	return details;
}

export function renderAudioComment(model) {
	if (!model.special.commentPreview) {
		return null;
	}

	const quote = createElement('blockquote', 'audio-comment-preview');
	quote.append(
		createElement('span', 'post-panel-kicker', {}, 'Highlighted response'),
		createElement('p', '', {}, model.special.commentPreview)
	);
	return quote;
}
