// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchHistoryView
 * @description
 * The Awtsmoos turns browser-local search memory into a navigable archive of years, months, days, kinds, and origins;
 * Awtsmoos.com lets a manual query, post selection, or comment selection remain one click from return without becoming a flat pile.
 */

import { groupHistoryByDate } from './historyGroups.js';

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
	if (entry.mode === 'exact') return entry.corpus === 'all' ? 'All corpora' : entry.corpus;
	if (entry.mode === 'tanach') return entry.book || 'All Tanach';
	if (entry.mode === 'related') return ORIGIN_LABELS[entry.origin] || entry.origin;
	return entry.lane || 'All libraries';
}

function historyButton(entry, onChoose) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'library-history-item';
	const query = document.createElement('strong');
	query.textContent = entry.query;
	const meta = document.createElement('small');
	const time = new Date(entry.visitedAt).toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit'
	});
	meta.textContent = `${MODE_LABELS[entry.mode] || entry.mode} · ${contextLabel(entry)} · ${time}`;
	button.append(query, meta);
	button.addEventListener('click', () => onChoose(entry));
	return button;
}

function daySection(day, onChoose) {
	const section = document.createElement('section');
	section.className = 'library-history-day';
	const heading = document.createElement('h4');
	heading.textContent = day.label;
	section.append(heading, ...day.entries.map(entry => historyButton(entry, onChoose)));
	return section;
}

function monthSection(month, onChoose, open) {
	const details = document.createElement('details');
	details.className = 'library-history-month';
	details.open = open;
	const summary = document.createElement('summary');
	summary.textContent = `${month.label} · ${month.days.reduce((sum, day) => sum + day.entries.length, 0)}`;
	details.append(summary, ...month.days.map(day => daySection(day, onChoose)));
	return details;
}

function yearSection(year, onChoose, open) {
	const details = document.createElement('details');
	details.className = 'library-history-year';
	details.open = open;
	const summary = document.createElement('summary');
	const count = year.months.reduce((sum, month) => {
		return sum + month.days.reduce((monthSum, day) => monthSum + day.entries.length, 0);
	}, 0);
	summary.textContent = `${year.label} · ${count}`;
	details.append(summary);
	year.months.forEach((month, index) => {
		details.append(monthSection(month, onChoose, open && index === 0));
	});
	return details;
}

function matchesFilter(entry, filter) {
	return filter === 'all'
		|| entry.mode === filter
		|| entry.origin === filter
		|| entry.category === filter;
}

export function renderSearchHistory({
	entries,
	container,
	filter = 'all',
	onChoose
}) {
	const visible = entries.filter(entry => matchesFilter(entry, filter));
	container.replaceChildren();
	if (!visible.length) {
		const empty = document.createElement('p');
		empty.textContent = entries.length ? 'No searches in this category yet.' : 'No local searches yet.';
		container.append(empty);
		return;
	}
	groupHistoryByDate(visible).forEach((year, index) => {
		container.append(yearSection(year, onChoose, index === 0));
	});
}
