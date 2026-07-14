// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSidebar
 * @description
 * Coordinates Mail navigation while small owners render controls and choices.
 * The Awtsmoos keeps Awtsmoos.com folders, sender categories, search, and
 * threads synchronized without rebuilding a second identity universe.
 */
import {
	setMailSenderCategory,
	setMailView,
	subscribe
} from '../store.js';
import { FX } from './fx.js';
import {
	renderMailFolders,
	renderMailSenderCategories
} from './sidebarChoices.js';
import {
	renderSidebarCompose,
	renderSidebarIdentity,
	renderSidebarSearch
} from './sidebarControls.js';
import { renderThreadList as paintThreadList } from './sidebarThreads.js';
import { switchChat } from './chat.js';

let uiRef = null;
let subscribed = false;

/** Repaints every dynamic sidebar collection. */
export function renderThreadList(ui = uiRef) {
	if (!ui) {
		return;
	}
	renderMailFolders(ui, updateFolder);
	renderMailSenderCategories(ui, updateSenderCategory);
	paintThreadList(ui, openThread);
}

/** Builds the complete accessible Mail sidebar. */
export function renderSidebar(ui, parent) {
	uiRef = ui;
	bindSidebarSubscription();
	renderSidebarIdentity(ui, parent);
	renderSidebarCompose(ui, parent);
	renderSidebarSearch(ui, parent);
	renderChoiceMount(ui, parent, {
		shaym: 'mailSenderCategoryGrid',
		className: 'mail-sender-category-grid',
		label: 'Sender categories'
	});
	renderChoiceMount(ui, parent, {
		shaym: 'mailFolderList',
		className: 'mail-folder-list',
		label: 'Mail folders'
	});
	ui.html({
		parent,
		tag: 'div',
		shaym: 'threadList',
		classList: ['thread-list'],
		attributes: { 'aria-live': 'polite' }
	});
	renderThreadList(ui);
}

function renderChoiceMount(ui, parent, { shaym, className, label }) {
	ui.html({
		parent,
		tag: 'div',
		shaym,
		classList: [className],
		attributes: {
			role: 'tablist',
			'aria-label': label
		}
	});
}

function bindSidebarSubscription() {
	if (subscribed) {
		return;
	}
	subscribed = true;
	subscribe(key => {
		if (['snippets', 'mailView', 'mailSearch', 'mailSenderCategory'].includes(key)) {
			renderThreadList();
		}
	});
}

function updateFolder(view) {
	setMailView(view);
	FX.playSound?.('hover');
}

function updateSenderCategory(category) {
	setMailSenderCategory(category);
	FX.playSound?.('hover');
}

function openThread(thread, displayName) {
	FX.playSound?.('hover');
	switchChat(uiRef, thread.correspondent, displayName);
	renderThreadList();
}
