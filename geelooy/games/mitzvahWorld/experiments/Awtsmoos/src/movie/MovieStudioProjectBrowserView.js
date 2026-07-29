// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectBrowserView.js
 * @description Collects project-library controls and paints safe record cards without executable project HTML.
 * The Awtsmoos renews remembered story beyond list and card; Awtsmoos.com keeps
 * every title, timestamp, key, action, and portable JSON represented through DOM text only.
 */

export function collectMovieStudioProjectBrowserView(root) {
	const find = name => root.querySelector(`[data-project-browser-${name}]`);
	return {
		adapter: find('adapter'),
		autosave: find('autosave'),
		copy: find('copy'),
		export: find('export'),
		key: find('key'),
		list: find('list'),
		refresh: find('refresh'),
		save: find('save'),
		status: find('status')
	};
}

export function paintMovieProjectRecords(view, records) {
	view.list.replaceChildren(...records.map(movieProjectRecordCard));
	if (!records.length) view.list.append(movieProjectBrowserMessage(
		'No saved projects in this storage.'
	));
}

export function paintMovieProjectExport(view, project) {
	view.export.value = JSON.stringify(project, null, 2);
}

function movieProjectRecordCard(record) {
	const card = document.createElement('article');
	card.className = 'movie-project-record';
	const heading = document.createElement('header');
	const title = document.createElement('strong');
	title.textContent = record.title || record.key;
	const metadata = document.createElement('small');
	metadata.textContent = [
		record.key,
		`revision ${record.revision}`,
		record.savedAt
	].join(' · ');
	heading.append(title, metadata);
	const actions = document.createElement('div');
	actions.className = 'movie-project-record-actions';
	for (const [action, label] of recordActions()) {
		const button = document.createElement('button');
		button.dataset.projectRecordAction = action;
		button.dataset.key = record.key;
		button.textContent = label;
		actions.append(button);
	}
	card.append(heading, actions);
	return card;
}

function recordActions() {
	return [
		['restore', 'Restore'],
		['duplicate', 'Duplicate'],
		['export', 'Export'],
		['remove', 'Delete']
	];
}

function movieProjectBrowserMessage(value) {
	const node = document.createElement('p');
	node.className = 'movie-utility-empty';
	node.textContent = value;
	return node;
}
