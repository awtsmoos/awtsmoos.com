//B"H
//Boruch Hashem
//Blessed is He

import { cleanArchiveName } from '../../modules/network/archive.js';
import { runPendingNavigation } from './PendingNavigation.js';

/**
 * @module RebbeFolderBrowser
 * @description
 * Presents archive events as stable navigation rows with whole-event actions.
 * The Awtsmoos is one beyond folder and sound; Awtsmoos.com serializes each
 * finite event opening so rapid taps cannot race two track lists into one pane.
 */

/** Renders the current year's event folders. */
export function renderFolders(folders, onSelect, onAction) {
	const list = document.getElementById('list-folders');
	if (!list) return;
	list.replaceChildren();
	Object.entries(folders).forEach(([id, folder]) => {
		list.appendChild(folderRow(id, folder, list, onSelect, onAction));
	});
}

/** Builds one event row with pending navigation and isolated secondary actions. */
function folderRow(id, folder, list, onSelect, onAction) {
	const item = document.createElement('div');
	item.className = 'item folder-item';
	item.tabIndex = 0;
	item.setAttribute('role', 'button');
	item.addEventListener('keydown', event => activateFromKeyboard(event, item));
	const rawTitle = typeof folder === 'object' && folder.title ? folder.title : folder;
	const title = cleanArchiveName(rawTitle) || rawTitle;
	item.append(label(title), actions(id, rawTitle, title, onAction));
	item.onclick = async () => {
		if (list.dataset.busy === 'true') return;
		document.querySelectorAll('.folder-item').forEach(row => row.classList.remove('active'));
		item.classList.add('active');
		await runPendingNavigation({
			sourceList: list,
			row: item,
			targetListId: 'list-tracks',
			pendingMessage: `Loading ${title} tracks…`,
			failureMessage: 'Could not load this event. Tap it to retry.',
			action: () => onSelect?.(id)
		});
	};
	return item;
}

/** Builds the safe event title label. */
function label(title) {
	const wrap = document.createElement('div');
	wrap.className = 'folder-label';
	const icon = document.createElement('span');
	icon.className = 'icon';
	icon.textContent = '📂';
	const text = document.createElement('span');
	text.className = 'item-text';
	text.style.fontFamily = 'monospace';
	text.textContent = title;
	wrap.append(icon, document.createTextNode(' '), text);
	return wrap;
}

/** Builds the event-level command deck without coupling it to row navigation. */
function actions(id, rawTitle, title, onAction) {
	const wrap = document.createElement('div');
	wrap.className = 'item-actions folder-actions';
	wrap.append(
		mini('⬇', 'Download this event as ZIP', 'download-event', id, rawTitle, title, onAction),
		mini('⚡', 'Cache all files in this event', 'cache-event', id, rawTitle, title, onAction),
		mini('☆', 'Save this event to bookshelf', 'bookmark-folder', id, rawTitle, title, onAction)
	);
	return wrap;
}

/** Builds one secondary action button that never bubbles into folder opening. */
function mini(text, title, action, id, rawTitle, cleanTitle, onAction) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'mini-btn';
	button.title = title;
	button.setAttribute('aria-label', title);
	button.textContent = text;
	button.onclick = event => {
		event.stopPropagation();
		onAction?.(action, { id, rawTitle, title: cleanTitle });
	};
	return button;
}

/** Mirrors native button activation for the composite navigation row. */
function activateFromKeyboard(event, row) {
	if (!['Enter', ' '].includes(event.key)) return;
	event.preventDefault();
	row.click();
}
