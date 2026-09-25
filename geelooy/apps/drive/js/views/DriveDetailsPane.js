//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveDetailsPane
 * @description Renders selected-entry testimony in the wide explorer rail:
 * Details, Project (linked), and History (provenance) tabs.
 */
import { publicUrl } from '../api.js';
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { DriveEntryPresenter } from './DriveEntryPresenter.js';
import { DriveLabelsEditor } from './DriveLabelsEditor.js';
import { renderHistoryTabPane } from './DriveHistoryTab.js';
import { renderProjectTab } from './DriveProjectTab.js';

const DETAILS_TABS = [['details', 'Details'], ['project', 'Project'], ['history', 'History']];

export class DriveDetailsPane {
	constructor(onAction, onSaved = () => {}) {
		Object.assign(this, { onAction, activeTab: 'details' });
		this.presenter = new DriveEntryPresenter();
		this.labelsEditor = new DriveLabelsEditor(onSaved);
	}

	install(onClose = () => {}) { document.querySelector('#drive-details-close')?.addEventListener('click', onClose); }

	render(entry) {
		const pane = document.querySelector('#drive-details');
		const body = document.querySelector('#drive-details-body');
		if (!pane || !body) return;
		this.entry = entry;
		if (!entry) { pane.hidden = true; body.replaceChildren(); return; }
		pane.hidden = false;
		body.replaceChildren(this.content(this.presenter.present(entry)));
	}

	content(item) {
		const fragment = document.createDocumentFragment();
		const hero = this.node('div', 'drive-details-hero');
		hero.append(createDriveEntryGlyph(item), this.node('h2', '', item.name), this.node('p', '', item.meta));
		fragment.append(hero, this.tabBar(), this.tabPane(item));
		return fragment;
	}

	tabBar() {
		const bar = this.node('div', 'drive-details-tabs');
		bar.setAttribute('role', 'tablist');
		for (const [id, label] of DETAILS_TABS) {
			const tab = this.node('button', 'drive-details-tab' + (this.activeTab === id ? ' is-active' : ''), label);
			tab.type = 'button';
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-selected', String(this.activeTab === id));
			tab.addEventListener('click', () => { this.activeTab = id; this.render(this.entry); });
			bar.append(tab);
		}
		return bar;
	}

	tabPane(item) {
		if (this.activeTab === 'project') return renderProjectTab(item.entry, this.onAction);
		if (this.activeTab === 'history') {
			const wrap = this.node('div', 'drive-details-history', 'Loading history…');
			renderHistoryTabPane(item.entry).then(
				node => wrap.replaceChildren(node),
				() => { wrap.textContent = 'History is unavailable right now.'; }
			);
			return wrap;
		}
		const details = document.createDocumentFragment();
		details.append(this.actions(item.entry), this.facts(item), this.labelsEditor.section(item.entry));
		if (item.isPublic && item.entry.type === 'file') details.append(this.publicBlock(item.entry));
		return details;
	}

	actions(entry) {
		const wrap = this.node('div', 'drive-details-actions');
		const names = ['open', entry.visibility === 'public' ? 'link' : 'public', 'rename', 'move', 'copy', 'trash'];
		for (const action of names) {
			const button = this.node('button', action === 'trash' ? 'is-danger' : '', this.label(action));
			button.type = 'button';
			button.dataset.detailsAction = action;
			button.addEventListener('click', () => this.onAction(action, entry));
			wrap.append(button);
		}
		return wrap;
	}

	facts(item) {
		const list = this.node('dl', 'drive-details-facts');
		const facts = [['Location', item.entry.path], ['Type', item.entry.type], ['Size', item.size], ['Modified', item.modified], ['Visibility', item.entry.visibility || 'private']];
		for (const [term, value] of facts) list.append(this.node('dt', '', term), this.node('dd', '', value));
		return list;
	}

	publicBlock(entry) {
		const wrap = this.node('div', 'drive-details-public');
		const url = publicUrl(entry.path);
		const copy = this.node('button', 'drive-details-copy', 'Copy');
		copy.type = 'button';
		copy.addEventListener('click', () => this.onAction('link', entry));
		wrap.append(this.node('strong', '', 'Public URL'), this.node('code', '', url), copy);
		return wrap;
	}

	label(action) {
		return ({ open: 'Open', link: 'Copy link', public: 'Make public', rename: 'Rename', move: 'Move', copy: 'Make a copy', trash: 'Delete' })[action] || action;
	}

	node(tag, className = '', text = '') {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text) node.textContent = text;
		return node;
	}
}
