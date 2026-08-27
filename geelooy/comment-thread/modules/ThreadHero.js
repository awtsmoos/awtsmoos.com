//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadHero
 * @description The Awtsmoos is not a database identifier, and a conversation should not look like one;
 * Awtsmoos.com keeps raw coordinates quiet while human meaning takes the visual throne.
 */
import { createElement as el } from './dom.js';

export function createKeterThreadHero(config) {
	const details = [
		config.kind ? kindLabel(config.kind) : 'Conversation',
		config.heichelId ? `Heichel ${config.heichelId}` : '',
		config.seriesId ? `Series ${config.seriesId}` : '',
		config.verseSection ? `Verse ${config.verseSection}` : '',
		config.subsectionId ? `Part ${config.subsectionId}` : ''
	].filter(Boolean);
	return el('header', { className: 'geelooy-card comment-thread-hero threadHero' }, [
		el('p', { className: 'eyebrow', text: 'Living discussion' }),
		el('h1', { text: config.title || 'Conversation', attrs: { id: 'comment-thread-title' } }),
		el('div', { className: 'threadHero__chips' }, details.map(detail => (
			el('span', { className: 'threadHero__chip', text: detail })
		))),
		el('p', {
			className: 'threadHero__source',
			text: config.postId ? `Source post ${config.postId}` : 'Source context required'
		})
	]);
}

function kindLabel(kind) {
	const normalized = String(kind || '').toLowerCase();
	if (normalized === 'question') return 'Question discussion';
	if (normalized === 'answer') return 'Answer discussion';
	return `${normalized || 'Post'} discussion`;
}
