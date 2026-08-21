//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveSource } from './archive/ArchiveSource.js';
import { MetaArchiveParser } from './meta/MetaArchiveParser.js';

/**
 * @class MigrationController
 * @description
 * The Awtsmoos orders local discovery, server preflight, dry intention, selected upload, renewed planning, and publication;
 * Awtsmoos.com makes every causal boundary visible so choosing an archive can never secretly mutate the social world.
 */
export class MigrationController {
	constructor(options) {
		Object.assign(this, options);
		this.planEntries = [];
		this.root.getElementById('generatePlan').addEventListener('click', () => void this.generatePlan());
		this.store.addEventListener('change', () => this.renderer.render());
		this.renderer.render();
		void this.loadCapabilities();
	}

	async loadCapabilities() {
		try {
			const capabilities = await this.runner.capabilities();
			this.store.setCapabilities(capabilities);
			this.status.show(
				`Server ready · ${capabilities.plan.maxItems} items/plan · ` +
				`${capabilities.upload.maxFilesPerRequest} files/upload request.`
			);
		} catch (error) {
			this.status.show(`Server capability check failed: ${error.message}`, 'error');
		}
	}

	async openArchive(files, provider = '') {
		try {
			this.status.show('Reading local archive index…');
			const source = await ArchiveSource.fromFiles(files);
			const parser = new MetaArchiveParser(source, provider);
			const result = await parser.parse(progress => {
				this.status.meter(progress.current, progress.total);
				this.status.show(`Reading metadata ${progress.current}/${progress.total} locally…`);
			});
			this.store.setItems(result.items, source, result);
			this.checkpoint.save(this.store.snapshot());
			this.status.complete(`${result.items.length} authored memories are ready for local review.`);
		} catch (error) {
			this.status.complete(`Archive could not be opened: ${error.message}`);
		}
	}

	validate() {
		const state = this.store.snapshot();
		if (!state.selectedIds.size) throw new Error('Select at least one memory.');
		if (!this.destination.valid(state)) throw new Error('Choose an Alias and Heichel first.');
		return state;
	}

	async generatePlan() {
		try {
			const state = this.validate();
			this.status.show('Running server preflight. Nothing is being published.');
			const preflight = await this.runner.preflight(state);
			this.store.setPreflight(preflight);
			this.status.show('Preflight passed. Generating the dry publication plan…');
			const planned = await this.runner.dryPlan(state);
			this.planEntries = planned.entries;
			this.checkpoint.save(state);
			const warningCount = planned.plans.reduce((count, plan) => count + (plan.warnings?.length || 0), 0);
			this.status.complete(
				`Dry plan ready: ${this.planEntries.length} entries · ${warningCount} evidence warnings.`
			);
			this.review.open(state, this.planEntries);
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	async beginImport() {
		try {
			const state = this.validate();
			this.review.close();
			await this.upload(state);
			this.status.show('Rebuilding dry plan with native uploaded asset manifests…');
			const planned = await this.runner.dryPlan(state);
			await this.publish(state, planned.entries);
			this.checkpoint.save(state);
			this.status.complete(
				`${Object.keys(state.completed).length} memories published; ${state.failures.length} need retry.`
			);
			this.renderer.render();
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	async upload(state) {
		this.status.show('Uploading only media required by the selected memories…');
		await this.runner.uploadSelectedMedia(state, state.archive, progress => {
			this.status.meter(progress.current, progress.total);
		});
	}

	async publish(state, entries) {
		let completed = 0;
		await this.runner.publish(state, entries, result => {
			completed += 1;
			this.status.meter(completed, entries.length);
			this.status.show(result.ok
				? `Published ${completed}/${entries.length} idempotently…`
				: `Recorded failure ${completed}/${entries.length}; continuing safely…`
			);
		});
	}
}
