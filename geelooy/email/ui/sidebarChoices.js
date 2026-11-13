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
	// B"H social fix 13 (defect 3): at boot the folders paint before
	// refreshSnippets() completes, when state.snippets is still [] — so
	// folderCounts([]) returned all zeros and the badges briefly read
	// "0 threads" before settling at 2. Same class as the profile stat:
	// never show a count until it is final. While the history is still
	// loading and no snippets have arrived, paint "—" instead of 0.
	// (state.isLoadingHistory is true initially and false once
	// refreshSnippets completes; the 'snippets' subscription re-renders
	// with the real counts when they arrive. During a later poll refresh
	// snippets are non-empty, so the real counts keep showing.)
	const loading = state.isLoadingHistory && !(state.snippets || []).length;
	const counts = folderCounts(state.snippets || []);
	list.replaceChildren(...MAIL_FOLDERS.map(folder => {
		return choiceButton({
			id: folder.id,
			presentation: folderPresentation(folder),
			count: loading ? null : (counts[folder.id] || 0),
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
	// B"H social fix 13 (defect 3): same loading rule as the folders —
	// paint "—" while the history is still loading and no snippets have
	// arrived, never a premature 0.
	const loading = state.isLoadingHistory && !(state.snippets || []).length;
	const counts = categoryCounts(state.snippets || []);
	grid.replaceChildren(...SENDER_CATEGORIES.map(category => {
		return choiceButton({
			id: category.id,
			presentation: categoryPresentation(category),
			count: loading ? null : (counts[category.id] || 0),
			active: state.senderCategory === category.id,
			kind: 'category'
		});
	}));
	grid.querySelectorAll('button').forEach(button => {
		button.addEventListener('click', () => onSelect(button.dataset.category));
	});
}

/** Creates one truthful, icon-led folder or category choice.
 * B"H social fix 13 (defect 3): a null count means "still loading" —
 * the badge shows "—" and the label says "loading", never a
 * premature 0. */
function choiceButton({ id, presentation, count, active, kind }) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `${kind === 'folder' ? 'mail-folder-tab' : 'mail-sender-category'}${active ? ' active' : ''}`;
	button.dataset[kind] = id;
	button.setAttribute('role', 'tab');
	button.setAttribute('aria-selected', String(active));
	button.setAttribute('aria-label', count == null
		? `${presentation.label}, loading ${kind === 'folder' ? 'threads' : 'senders'}`
		: `${presentation.label}, ${count} ${kind === 'folder' ? 'threads' : 'senders'}`);
	button.append(
		choiceIcon(presentation),
		choiceLabel(presentation.label),
		choiceCount(count)
	);
	return button;
}

/** Creates the separately-hidden decorative golden identity mark. */
function choiceIcon(presentation) {
	const frame = document.createElement('span');
	frame.className = 'mail-choice-emoji';
	frame.setAttribute('aria-hidden', 'true');
	const img = document.createElement('img');
	img.className = `gicon gicon--sm ${presentation.iconClass || ''}`.trim();
	img.src = presentation.iconUrl || '';
	img.alt = '';
	img.loading = 'lazy';
	img.decoding = 'async';
	img.width = 24;
	img.height = 24;
	frame.append(img);
	return frame;
}

/** Creates the visible canonical label. */
function choiceLabel(label) {
	const node = document.createElement('span');
	node.className = 'mail-choice-label';
	node.textContent = label;
	return node;
}

/** Creates the truthful count badge. A null count means "still loading"
 * (B"H social fix 13, defect 3) and renders "—", never a premature 0. */
function choiceCount(count) {
	const node = document.createElement('span');
	node.className = 'mail-folder-count';
	node.textContent = count == null ? '—' : String(count);
	return node;
}
