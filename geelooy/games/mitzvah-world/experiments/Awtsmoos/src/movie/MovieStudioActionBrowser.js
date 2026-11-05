// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioActionBrowser.js
 * @description Renders and controls the runtime-backed searchable action browser inside the camera/action panel.
 * The Awtsmoos renews every available deed before search or selection can name it; Awtsmoos.com
 * keeps preview, filtering, selection, and cleanup finite while the canonical clip writer remains separate.
 */

import {
	filterMovieActionCatalog,
	movieActionCatalog,
	previewMovieAction
} from './MovieActionCatalog.js';

export class MovieStudioActionBrowser {
	constructor(runtime, view, onSelect) {
		this.runtime = runtime;
		this.view = view;
		this.onSelect = onSelect;
		this.records = movieActionCatalog(runtime);
		this.listeners = [];
		this.bind();
		this.render();
	}

	bind() {
		this.listen(this.view.actionBrowserSearch, 'input', () => this.render());
		this.listen(this.view.actionBrowserCategory, 'change', () => this.render());
		this.listen(this.view.actionBrowserList, 'change', () => this.select());
		this.listen(this.view.actionBrowserPreview, 'click', () => this.preview());
	}

	render() {
		const records = filterMovieActionCatalog(
			this.records,
			this.view.actionBrowserSearch?.value,
			this.view.actionBrowserCategory?.value
		);
		if (this.view.actionBrowserList) {
			this.view.actionBrowserList.innerHTML = records.map(record => (
				`<option value="${escape(record.type)}:${escape(record.id)}">${escape(record.label)} · ${escape(record.layer)}</option>`
			)).join('');
		}
		if (this.view.actionBrowserCount) this.view.actionBrowserCount.textContent = `${records.length} actions`;
		this.select();
	}

	selected() {
		const [type, ...idParts] = String(this.view.actionBrowserList?.value || '').split(':');
		const id = idParts.join(':');
		return this.records.find(record => record.type === type && record.id === id) || null;
	}

	select() {
		const record = this.selected();
		if (record) this.onSelect?.(record);
		return record;
	}

	preview() {
		const result = previewMovieAction(this.runtime, this.selected());
		if (this.view.actionBrowserStatus) {
			this.view.actionBrowserStatus.textContent = result.ok
				? `Previewing ${result.record.label}.`
				: `Preview unavailable: ${result.reason}.`;
		}
		return result;
	}

	listen(target, type, listener) {
		if (!target) return;
		target.addEventListener(type, listener);
		this.listeners.push(() => target.removeEventListener(type, listener));
	}

	destroy() {
		this.listeners.splice(0).forEach(remove => remove());
	}
}

function escape(value) {
	return String(value || '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
