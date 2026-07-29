// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectBrowserController.js
 * @description Connects verified persistence operations to the project-library utility surface.
 * The Awtsmoos renews memory without anxiety or confusion; Awtsmoos.com lets
 * save, restore, duplicate, delete, export, autosave, refresh, and cleanup remain explicit.
 */

import { MovieStudioProjectBrowserService } from './MovieStudioProjectBrowserService.js';
import {
	collectMovieStudioProjectBrowserView,
	paintMovieProjectExport,
	paintMovieProjectRecords
} from './MovieStudioProjectBrowserView.js';

export class MovieStudioProjectBrowserController {
	constructor(session, root) {
		this.session = session;
		this.view = collectMovieStudioProjectBrowserView(root);
		this.service = new MovieStudioProjectBrowserService(session);
		this.listeners = [];
		this.bind();
		paintMovieProjectExport(this.view, session.project);
	}

	bind() {
		this.listen(this.view.save, 'click', () => this.run(() => this.save()));
		this.listen(this.view.autosave, 'click', () => this.toggleAutosave());
		this.listen(this.view.refresh, 'click', () => this.run(() => this.refresh()));
		this.listen(this.view.copy, 'click', () => this.run(() => this.copy()));
		this.listen(this.view.list, 'click', event => this.onListClick(event));
	}

	adapterId() {
		return this.view.adapter?.value || 'localStorage';
	}

	key() {
		return String(this.view.key?.value || 'my-movie').trim() || 'my-movie';
	}

	async save() {
		const key = this.key();
		await this.service.save(this.adapterId(), key);
		this.status(`Saved ${key}.`);
		return this.refresh();
	}

	toggleAutosave() {
		const result = this.service.toggleAutosave(this.adapterId(), this.key());
		this.view.autosave.textContent = result.active ? 'Stop autosave' : 'Start autosave';
		this.status(result.active ? `Autosave started for ${this.key()}.` : 'Autosave stopped.');
		return result;
	}

	async refresh() {
		const records = await this.service.list(this.adapterId());
		paintMovieProjectRecords(this.view, records);
		paintMovieProjectExport(this.view, this.session.project);
		this.status(`${records.length} saved projects.`);
		return records;
	}

	async onListClick(event) {
		const button = event.target.closest?.('[data-project-record-action]');
		if (!button) return;
		const action = button.dataset.projectRecordAction;
		const key = button.dataset.key;
		await this.run(async () => {
			if (action === 'restore') await this.service.restore(this.adapterId(), key);
			if (action === 'duplicate') await this.service.duplicate(this.adapterId(), key);
			if (action === 'remove') await this.service.remove(this.adapterId(), key);
			if (action === 'export') this.view.export.value = await this.service.export(this.adapterId(), key);
			await this.refresh();
		});
	}

	async copy() {
		const text = this.view.export.value || JSON.stringify(this.session.project, null, 2);
		if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
		this.status('Project JSON copied.');
	}

	async run(action) {
		try {
			return await action();
		} catch (error) {
			this.status(`Project library error: ${error.message}`);
			return null;
		}
	}

	status(value) {
		if (this.view.status) this.view.status.textContent = value;
	}

	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}

	destroy() {
		this.listeners.splice(0).forEach(remove => remove());
	}
}
