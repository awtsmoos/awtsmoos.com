// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSidebarChoices
 * @description
 * The Awtsmoos gives every mailbox destination a recognizable sign without changing the truth it selects;
 * Awtsmoos.com keeps count, icon, copy, and active state in separate vessels that the eye quickly connects.
 */
import { state } from '../store.js';
import {
	MAIL_FOLDERS,
	SENDER_CATEGORIES,
	categoryCounts,
	folderCounts
} from './mailFolders.js';
import {
	categoryPresentation,
	folderPresentation
} from './sidebarPresentation.js';

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
			presentation: folderPresentation(folder),
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
			presentation: categoryPresentation(category),
			count: counts[category.id] || 0,
			active: state.senderCategory === category.id,
			kind: 'category'
		});
	}));
	grid.querySelectorAll('button').forEach(button => {
		button.addEventListener('click', () => onSelect(button.dataset.category));
	});
}

/** Creates one truthful, icon-led folder or category choice. */
function choiceButton({ id, presentation, count, active, kind }) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `${kind === 'folder' ? 'mail-folder-tab' : 'mail-sender-category'}${active ? ' active' : ''}`;
	button.dataset[kind] = id;
	button.setAttribute('role', 'tab');
	button.setAttribute('aria-selected', String(active));
	button.setAttribute('aria-label', `${presentation.label}, ${count} ${kind === 'folder' ? 'threads' : 'senders'}`);
	button.append(
		choiceEmoji(presentation.emoji),
		choiceLabel(presentation.label),
		choiceCount(count)
	);
	return button;
}

/** Creates the separately-hidden decorative identity mark. */
function choiceEmoji(emoji) {
	const node = document.createElement('span');
	node.className = 'mail-choice-emoji';
	node.setAttribute('aria-hidden', 'true');
	node.textContent = emoji;
	return node;
}

/** Creates the visible canonical label. */
function choiceLabel(label) {
	const node = document.createElement('span');
	node.className = 'mail-choice-label';
	node.textContent = label;
	return node;
}

/** Creates the truthful count badge. */
function choiceCount(count) {
	const node = document.createElement('span');
	node.className = 'mail-folder-count';
	node.textContent = String(count);
	return node;
}
