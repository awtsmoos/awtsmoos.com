//B"H
// Boruch Hashem
// Blessed is He
/** Renders one calm file row; deeper actions wait behind the familiar More menu. */
import { formatBytes, formatDate } from './format.js';

export function renderRow(entry, onAction) {
	const row = document.createElement('tr');
	row.dataset.entryType = entry.type;
	row.append(
		childCell(primaryEntry(entry, onAction), 'entry-name-cell'),
		textCell(entry.type),
		textCell(entry.type === 'file' ? formatBytes(entry.size) : '—'),
		textCell(entry.visibility || '—'),
		textCell(entry.cachePolicy || '—'),
		textCell(formatDate(entry.updatedAt)),
		actionCell(entry, onAction)
	);
	return row;
}

function primaryEntry(entry, onAction) {
	const wrapper = document.createElement('div');
	wrapper.className = 'entry-primary';
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'name-button';
	button.textContent = entry.path;
	button.addEventListener('click', () => onAction('open', entry));
	const meta = document.createElement('small');
	meta.className = 'entry-mobile-meta';
	meta.textContent = mobileMeta(entry);
	wrapper.append(button, meta);
	return wrapper;
}

function actionCell(entry, onAction) {
	const cell = document.createElement('td');
	cell.className = 'actions';
	const details = document.createElement('details');
	details.className = 'entry-menu';
	const summary = document.createElement('summary');
	summary.textContent = '⋯';
	summary.setAttribute('aria-label', `More actions for ${entry.path}`);
	const menu = document.createElement('div');
	menu.className = 'entry-menu-list';
	for (const action of entryActions(entry)) menu.append(actionButton(action, entry, onAction, details));
	details.append(summary, menu);
	cell.append(details);
	return cell;
}

function actionButton(action, entry, onAction, details) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = actionLabel(action);
	button.addEventListener('click', () => {
		details.open = false;
		onAction(action, entry);
	});
	return button;
}

function entryActions(entry) {
	const actions = entry.trashedAt ? ['restore', 'purge'] : ['metadata', 'move', 'copy', 'trash'];
	if (entry.type === 'file' && entry.visibility === 'public') actions.unshift('link');
	return actions;
}

function actionLabel(action) {
	const labels = { link: 'Copy link', metadata: 'File details', move: 'Move', copy: 'Make a copy', trash: 'Move to trash', restore: 'Restore', purge: 'Delete forever' };
	return labels[action] || action;
}

function mobileMeta(entry) {
	const parts = [entry.type === 'folder' ? 'Folder' : formatBytes(entry.size), entry.visibility].filter(Boolean);
	return parts.join(' · ');
}

function childCell(child, className = '') {
	const node = document.createElement('td');
	if (className) node.className = className;
	node.append(child);
	return node;
}

function textCell(value) {
	const node = document.createElement('td');
	node.textContent = String(value ?? '');
	return node;
}
