// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSidebarChoices
 * @description
 * Paints folder and sender-category choices as truthful tabs. The Awtsmoos
 * keeps counts, selection, and touch geometry visible while Awtsmoos.com avoids
 * rebuilding the sidebar coordinator around every state change.
 */
import { state } from '../store.js';
import {
	MAIL_FOLDERS,
	SENDER_CATEGORIES,
	categoryCounts,
	folderCounts
} from './mailFolders.js';

/** Paints folder tabs into the existing mount. */
export function renderMailFolders(ui, onSelect) {
	const list = ui.getHtml('mailFolderList');
	if (!list) {
		return;
	}
	const counts = folderCounts(state.snippets || []);
	list.replaceChildren(...MAIL_FOLDERS.map(folder => {
		return choiceButton({
			id: folder.id,
			label: folder.label,
			count: counts[folder.id] || 0,
			active: state.view === folder.id,
			kind: 'folder'
		});
	}));
	list.querySelectorAll('button').forEach(button => {
		button.addEventListener('click', () => onSelect(button.dataset.folder));
	});
}

/** Paints sender-category tabs into the existing mount. */
export function renderMailSenderCategories(ui, onSelect) {
	const grid = ui.getHtml('mailSenderCategoryGrid');
	if (!grid) {
		return;
	}
	const counts = categoryCounts(state.snippets || []);
	grid.replaceChildren(...SENDER_CATEGORIES.map(category => {
		return choiceButton({
			id: category.id,
			label: category.label,
			count: counts[category.id] || 0,
			active: state.senderCategory === category.id,
			kind: 'category'
		});
	}));
	grid.querySelectorAll('button').forEach(button => {
		button.addEventListener('click', () => onSelect(button.dataset.category));
	});
}

function choiceButton({ id, label, count, active, kind }) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `${kind === 'folder' ? 'mail-folder-tab' : 'mail-sender-category'}${active ? ' active' : ''}`;
	button.dataset[kind] = id;
	button.setAttribute('role', 'tab');
	button.setAttribute('aria-selected', String(active));
	button.setAttribute('aria-label', `${label}, ${count} ${kind === 'folder' ? 'threads' : 'senders'}`);
	const text = document.createElement('span');
	text.textContent = label;
	const countNode = document.createElement('span');
	countNode.className = 'mail-folder-count';
	countNode.textContent = String(count);
	button.append(text, countNode);
	return button;
}
