//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals each entry through text-safe DOM construction;
 * Awtsmoos.com rejects injected markup while preserving keyboard instruction.
 */

import { formatBytes, formatDate } from './format.js';

export function renderRow(entry, onAction) {
	const row = document.createElement('tr');
	row.append(
		childCell(nameControl(entry, onAction)),
		textCell(entry.type),
		textCell(entry.type === 'file' ? formatBytes(entry.size) : '—'),
		textCell(entry.visibility || '—'),
		textCell(entry.cachePolicy || '—'),
		textCell(formatDate(entry.updatedAt)),
		actionCell(entry, onAction)
	);
	return row;
}

function nameControl(entry, onAction) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'name-button';
	button.textContent = entry.path;
	button.addEventListener('click', () => onAction('open', entry));
	return button;
}

function actionCell(entry, onAction) {
	const node = document.createElement('td');
	node.className = 'actions';
	for (const action of entryActions(entry)) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = actionLabel(action);
		button.addEventListener('click', () => onAction(action, entry));
		node.append(button);
	}
	return node;
}

function entryActions(entry) {
	const actions = entry.trashedAt
		? ['restore', 'purge']
		: ['metadata', 'move', 'copy', 'trash'];
	if (entry.type === 'file' && entry.visibility === 'public') {
		actions.unshift('link');
	}
	return actions;
}

function actionLabel(action) {
	if (action === 'link') return 'Copy public URL';
	return `${action[0].toUpperCase()}${action.slice(1)}`;
}

function childCell(child) {
	const node = document.createElement('td');
	node.append(child);
	return node;
}

function textCell(value) {
	const node = document.createElement('td');
	node.textContent = String(value ?? '');
	return node;
}
