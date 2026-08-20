// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchHistoryView
 * @description
 * The Awtsmoos turns browser-local memory into a navigable archive of years, months, days, kinds, origins, and source returns;
 * Awtsmoos.com lets a manual query or reader selection be replayed while remembered post context remains one honest click away.
 */

import { historyEntryView } from './historyEntryView.js';
import { groupHistoryByDate } from './historyGroups.js';

function daySection(day, onChoose) {
	const section = document.createElement('section');
	section.className = 'library-history-day';
	const heading = document.createElement('h4');
	heading.textContent = day.label;
	section.append(
		heading,
		...day.entries.map(entry => historyEntryView(entry, onChoose))
	);
	return section;
}

function monthSection(month, onChoose, open) {
	const details = document.createElement('details');
	details.className = 'library-history-month';
	details.open = open;
	const summary = document.createElement('summary');
	const count = month.days.reduce((sum, day) => sum + day.entries.length, 0);
	summary.textContent = `${month.label} · ${count}`;
	details.append(
		summary,
		...month.days.map(day => daySection(day, onChoose))
	);
	return details;
}

function yearSection(year, onChoose, open) {
	const details = document.createElement('details');
	details.className = 'library-history-year';
	details.open = open;
	const summary = document.createElement('summary');
	const count = year.months.reduce((sum, month) => {
		return sum + month.days.reduce((monthSum, day) => {
			return monthSum + day.entries.length;
		}, 0);
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
		empty.textContent = entries.length
			? 'No searches in this category yet.'
			: 'No local searches yet.';
		container.append(empty);
		return;
	}
	groupHistoryByDate(visible).forEach((year, index) => {
		container.append(yearSection(year, onChoose, index === 0));
	});
}
