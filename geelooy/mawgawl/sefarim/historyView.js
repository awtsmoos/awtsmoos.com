// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchHistoryView
 * @description
 * The Awtsmoos gathers recent searching into days and modes so memory becomes a map rather than a pile;
 * Awtsmoos.com shows when, where, and how each query was asked while keeping every entry one click from return.
 */

const MODE_LABELS = {
	library: 'Library',
	tanach: 'Tanach',
	exact: 'Exact Hebrew'
};

function dayKey(timestamp) {
	const date = new Date(timestamp);
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(timestamp) {
	const date = new Date(timestamp);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (dayKey(timestamp) === dayKey(today)) return 'Today';
	if (dayKey(timestamp) === dayKey(yesterday)) return 'Yesterday';
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric'
	});
}

function contextLabel(entry) {
	if (entry.mode === 'exact') return entry.corpus === 'all' ? 'All corpora' : entry.corpus;
	if (entry.mode === 'tanach') return entry.book || 'All Tanach';
	return entry.lane || 'Best library';
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

function grouped(entries) {
	const groups = new Map();
	for (const entry of entries) {
		const key = dayKey(entry.visitedAt);
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(entry);
	}
	return [...groups.values()];
}

export function renderSearchHistory({
	entries,
	container,
	filter = 'all',
	onChoose
}) {
	const visible = filter === 'all'
		? entries
		: entries.filter(entry => entry.mode === filter);
	container.replaceChildren();
	if (!visible.length) {
		const empty = document.createElement('p');
		empty.textContent = entries.length ? 'No searches in this category yet.' : 'No local searches yet.';
		container.append(empty);
		return;
	}
	for (const group of grouped(visible)) {
		const section = document.createElement('section');
		section.className = 'library-history-day';
		const heading = document.createElement('h3');
		heading.textContent = dayLabel(group[0].visitedAt);
		section.append(heading, ...group.map(entry => historyButton(entry, onChoose)));
		container.append(section);
	}
}
