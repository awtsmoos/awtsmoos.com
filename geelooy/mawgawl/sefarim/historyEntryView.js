// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchHistoryEntryView
 * @description
 * The Awtsmoos lets one remembered search become both a path back into discovery and a path back to its source;
 * Awtsmoos.com keeps replay, source return, and Text/Semantic Library intent visible so local history becomes navigation rather than a log.
 */

import { strategyLabel } from './searchStrategy.js';

const MODE_LABELS = {
	library: 'Library',
	tanach: 'Tanach',
	exact: 'Exact Hebrew',
	related: 'Related'
};

const ORIGIN_LABELS = {
	'search-page': 'Search page',
	'post-selection': 'Post selection',
	'comment-selection': 'Comment selection'
};

function contextLabel(entry) {
	if (entry.mode === 'exact') {
		return entry.corpus === 'all' ? 'All corpora' : entry.corpus;
	}
	if (entry.mode === 'tanach') {
		return entry.book || 'All Tanach';
	}
	if (entry.mode === 'related') {
		return ORIGIN_LABELS[entry.origin] || entry.origin;
	}
	const scope = entry.lane || 'All libraries';
	return `${strategyLabel(entry.strategy)} · ${scope}`;
}

function metadata(entry) {
	const time = new Date(entry.visitedAt).toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit'
	});
	return `${MODE_LABELS[entry.mode] || entry.mode} · ${contextLabel(entry)} · ${time}`;
}

function replayButton(entry, onChoose) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'library-history-replay';
	const query = document.createElement('strong');
	query.textContent = entry.query;
	const meta = document.createElement('small');
	meta.textContent = metadata(entry);
	button.append(query, meta);
	button.addEventListener('click', () => onChoose(entry));
	return button;
}

export function historySourceUrl(entry = {}) {
	return String(entry.sourcePath || '').trim();
}

function sourceLink(entry) {
	const url = historySourceUrl(entry);
	if (!url) return null;
	const link = document.createElement('a');
	link.className = 'library-history-source';
	link.href = url;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = 'Return to source ↗';
	link.title = entry.sourceLabel || 'Open the source where this search began';
	return link;
}

export function historyEntryView(entry, onChoose) {
	const item = document.createElement('article');
	item.className = 'library-history-item';
	item.append(replayButton(entry, onChoose));
	const source = sourceLink(entry);
	if (source) item.append(source);
	return item;
}
