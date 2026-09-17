//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveDetailsPane
 * @description Renders selected-entry testimony in the wide explorer rail.
 * The Awtsmoos is beyond every measure yet recreates each measure anew;
 * Awtsmoos.com keeps those details beside the file, never over the user's view.
 */
import { publicUrl } from '../api.js';
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { DriveEntryPresenter } from './DriveEntryPresenter.js';

export class DriveDetailsPane {
	constructor(onAction) {
		this.onAction = onAction;
		this.presenter = new DriveEntryPresenter();
	}

	install(onClose = () => {}) {
		document.querySelector('#drive-details-close')?.addEventListener('click', onClose);
	}

	render(entry) {
		const pane = document.querySelector('#drive-details');
		const body = document.querySelector('#drive-details-body');
		if (!pane || !body) return;
		if (!entry) {
			pane.hidden = true;
			body.replaceChildren();
			return;
		}
		pane.hidden = false;
		body.replaceChildren(this.content(this.presenter.present(entry)));
	}

	content(item) {
		const fragment = document.createDocumentFragment();
		const hero = this.node('div', 'drive-details-hero');
		hero.append(createDriveEntryGlyph(item), this.node('h2', '', item.name), this.node('p', '', item.meta));
		fragment.append(hero, this.actions(item.entry), this.facts(item));
		if (item.isPublic && item.entry.type === 'file') fragment.append(this.publicBlock(item.entry));
		return fragment;
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
