//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveChatAttachmentPicker
 * @description Mountable Drive attachment picker for a future chat surface.
 * The Awtsmoos lets a person bring what is theirs into the conversation;
 * Awtsmoos.com offers the same files, the same selection, and an Attach door.
 *
 * Reuse (nothing rebuilt): DriveSelectionController for multi-select state,
 * DriveEntryPresenter + DriveEntryCard + DriveFolderCard for the browser's own
 * row rendering, and listEntriesAt for folder navigation that never disturbs
 * the main Drive browser. DriveBrowserRenderer itself is intentionally not
 * reused: it renders into a global #entry-rows host and reads the global
 * driveState.currentPath, which would couple the picker to the main browser.
 *
 * Host contract (no chat host exists in geelooy yet):
 *   const picker = mountAttachmentPicker(container, {
 *     onAttach(entries) { // entries: selected Drive entry objects
 *       chatComposer.attachFiles(entries); // host decides what "attach" means
 *       picker.unmount();
 *     },
 *     onClose() { picker.unmount(); },
 *     title: 'Attach from Drive',   // optional
 *     initialPath: ''               // optional Drive folder to open first
 *   });
 * The host page must include the Drive v5 styles for the entry cards.
 * Returns { unmount, refresh, selectedEntries }.
 */
import { listEntriesAt } from './api.js';
import { parentPath } from './path.js';
import { DriveEntryCard } from './views/DriveEntryCard.js';
import { DriveEntryPresenter } from './views/DriveEntryPresenter.js';
import { DriveFolderCard } from './views/DriveFolderCard.js';
import { DriveSelectionController } from './views/DriveSelectionController.js';

const PAGE_LIMIT = 100;

/** Mounts the picker into container; returns the picker handle. */
export function mountAttachmentPicker(container, options = {}) {
	if (!container || typeof container.append !== 'function') {
		throw new Error('mountAttachmentPicker requires a container element.');
	}
	const { onAttach = () => {}, onClose = () => {}, title = 'Attach from Drive', initialPath = '' } = options;
	const selection = new DriveSelectionController(() => paintFooter());
	const presenter = new DriveEntryPresenter();
	const menu = createPickerMenu(handleAction);
	const fileCard = new DriveEntryCard(handleAction, menu, selection);
	const folderCard = new DriveFolderCard(handleAction, menu, selection);

	let path = String(initialPath || '');
	let query = '';
	let entries = [];
	let loading = false;
	let error = '';
	let searchTimer = null;

	const root = document.createElement('section');
	root.className = 'drive-attachment-picker';
	root.setAttribute('aria-label', title);
	root.innerHTML = `
		<header class="drive-picker-header">
			<strong data-picker-title></strong>
			<button type="button" data-picker-close aria-label="Close picker">✕</button>
		</header>
		<div class="drive-picker-toolbar">
			<button type="button" data-picker-up aria-label="Go up one folder">↑</button>
			<span data-picker-location>My Drive</span>
			<input type="search" data-picker-search placeholder="Search files…" aria-label="Search files">
		</div>
		<div class="drive-picker-rows" role="listbox" aria-multiselectable="true" aria-label="Drive files"></div>
		<footer class="drive-picker-footer">
			<span data-picker-count>0 selected</span>
			<button type="button" data-picker-attach disabled>Attach</button>
		</footer>`;
	root.querySelector('[data-picker-title]').textContent = title;
	const rowsHost = root.querySelector('.drive-picker-rows');
	const locationLabel = root.querySelector('[data-picker-location]');
	const countLabel = root.querySelector('[data-picker-count]');
	const attachButton = root.querySelector('[data-picker-attach]');
	const upButton = root.querySelector('[data-picker-up]');
	const searchInput = root.querySelector('[data-picker-search]');

	root.querySelector('[data-picker-close]').addEventListener('click', () => onClose());
	upButton.addEventListener('click', () => navigate(parentPath(path)));
	searchInput.addEventListener('input', () => {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			query = searchInput.value.trim();
			load();
		}, 250);
	});
	attachButton.addEventListener('click', () => {
		onAttach(selectedEntries());
	});
	container.append(root);

	function handleAction(action, entry) {
		if (action === 'toggle-select' || action === 'select') {
			selection.toggle(entry);
			return;
		}
		if (action === 'open') {
			if (entry.type === 'folder') navigate(entry.path);
			else selection.toggle(entry);
		}
	}

	function navigate(nextPath) {
		path = String(nextPath || '');
		selection.clear();
		load();
	}

	async function load() {
		loading = true;
		error = '';
		paintRows();
		try {
			const result = await listEntriesAt(path, {
				search: query,
				sort: 'path',
				direction: 'asc',
				limit: PAGE_LIMIT
			});
			entries = result.entries || [];
		} catch (failure) {
			entries = [];
			error = failure?.message || String(failure);
		} finally {
			loading = false;
			paintRows();
		}
		return entries;
	}

	function paintRows() {
		locationLabel.textContent = path || 'My Drive';
		upButton.disabled = !path;
		rowsHost.replaceChildren();
		if (loading) {
			rowsHost.append(note('Loading files…'));
			return;
		}
		if (error) {
			rowsHost.append(note(error, true));
			return;
		}
		if (!entries.length) {
			rowsHost.append(note(query ? 'No files match your search.' : 'No files here yet.'));
			return;
		}
		const ordered = [...entries].sort((left, right) => {
			if (left.type === right.type) return String(left.path).localeCompare(String(right.path));
			return left.type === 'folder' ? -1 : 1;
		});
		for (const entry of ordered) {
			const presentation = presenter.present(entry);
			const card = presentation.isFolder ? folderCard.create(presentation) : fileCard.create(presentation);
			card.setAttribute('role', 'option');
			rowsHost.append(card);
		}
		selection.paint();
	}

	function paintFooter() {
		const count = selection.count();
		countLabel.textContent = `${count} selected`;
		attachButton.disabled = count === 0;
	}

	function selectedEntries() {
		return selection.entries(entries);
	}

	function note(text, isError = false) {
		const node = document.createElement('p');
		node.className = isError ? 'drive-picker-error' : 'drive-picker-empty';
		node.textContent = text;
		return node;
	}

	load();

	return {
		/** Removes the picker from its container. */
		unmount() {
			clearTimeout(searchTimer);
			selection.clear();
			root.remove();
		},
		/** Reloads the current picker folder. */
		refresh: load,
		/** Currently selected Drive entry objects. */
		selectedEntries
	};
}

/** Picker-scoped menu with only honest verbs: Select, and Open for folders. */
function createPickerMenu(onAction) {
	return {
		create(presentation) {
			const { entry, name } = presentation;
			const wrap = document.createElement('span');
			wrap.className = 'drive-picker-menu';
			wrap.append(menuButton('✓ Select', `Select ${name}`, () => onAction('toggle-select', entry)));
			if (entry.type === 'folder') {
				wrap.append(menuButton('Open ›', `Open folder ${name}`, () => onAction('open', entry)));
			}
			return wrap;
		}
	};
}

function menuButton(text, label, onClick) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'drive-picker-menu-button';
	button.textContent = text;
	button.setAttribute('aria-label', label);
	button.addEventListener('click', event => {
		event.stopPropagation();
		onClick();
	});
	return button;
}
