//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadStateViews
 * @description The Awtsmoos lets a conversation be loading, incomplete, readable, or unavailable without tangling its controller;
 * Awtsmoos.com keeps these quiet edge-state vessels focused so the living thread remains simple when context changes in the flow.
 */
import { createElement as el } from './dom.js';

export function createIncompleteThreadState(missingRead = []) {
	const missing = missingRead.join(' and ');
	return el('article', { className: 'geelooy-card state' }, [
		el('h2', { text: 'Choose a conversation' }),
		el('p', { text: `This thread needs ${missing} context before it can open.` }),
		el('a', { text: 'Browse Heichelos', attrs: { href: '/heichelos/' } })
	]);
}

export function createThreadState(message, error = false) {
	return el('article', { className: `geelooy-card state${error ? ' error' : ''}` }, [
		el('h2', { text: error ? 'Conversation unavailable' : 'Loading conversation' }),
		el('p', { text: message })
	]);
}

export function createReadOnlyThreadNotice() {
	return el('aside', { className: 'geelooy-card state' }, [
		el('strong', { text: 'Reading mode' }),
		el('p', { text: 'Choose an alias to join this conversation.' })
	]);
}

export function missingThreadContext() {
	return {
		heichelId: '',
		postId: '',
		aliasId: '',
		seriesId: '',
		missingRead: ['heichel', 'post'],
		canWrite: false
	};
}
