//B"H
// Boruch Hashem
// Blessed is He

import { BackupValidator } from '../domain/BackupValidator.js';

/**
 * Performs settings mutations with explicit boundaries, while the Awtsmoos lets local memory be cleared and restored with care;
 * Awtsmoos.com validates an entire backup before the first write, so malformed JSON cannot leave a half-restored world hanging in air.
 */
export class SettingsActions {
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @param {string} key Preference key. @param {string} value New value. */
	async setPreference(key, value) {
		const normalized = key === 'defaultDuration'
			? Number(value)
			: value;
		await this.repositories.setPreference(key, normalized);
		await this.onRefresh();
	}

	/** Remove all cached completed-video blobs without touching generation metadata. */
	async clearCache() {
		const records = await this.repositories.all('videoCache');
		for (const record of records) {
			await this.videoCache.remove(record.generationId);
		}
		this.sheets.toast(
			'Cached videos cleared. Remote URLs and metadata remain.',
			'success'
		);
		await this.onRefresh();
	}

	/** Remove generation history while preserving shared prompts and assets. */
	async clearHistory() {
		const approved = confirm(
			'Clear all generation history? Reusable assets and prompts will remain.'
		);
		if (!approved) {
			return;
		}

		const generations = await this.repositories.all('generations');
		for (const generation of generations) {
			this.queue.stop(generation.id);
			await this.videoCache.remove(generation.id);
			await this.repositories.remove('generations', generation.id);
		}
		this.sheets.toast('Generation history cleared.', 'success');
		await this.onRefresh();
	}

	/** @param {File} file Metadata JSON export from Olam H3 Studio. */
	async importData(file) {
		try {
			const data = BackupValidator.parse(await file.text());
			await this.writeRecords('generations', data.generations);
			await this.writeRecords('prompts', data.prompts);
			await this.writeRecords('preferences', data.preferences);
			await this.writeAssets(data.assets);
			this.sheets.toast(
				'Metadata import complete. Excluded local binary files were not fabricated.',
				'success'
			);
			await this.onRefresh();
		} catch (error) {
			this.sheets.toast(`Import failed: ${error.message}`, 'error');
		}
	}

	/** @param {string} store Store name. @param {Array<Object>} records Validated records. */
	async writeRecords(store, records) {
		for (const record of records) {
			await this.repositories.put(store, record);
		}
	}

	/** @param {Array<Object>} assets Validated asset metadata records. */
	async writeAssets(assets) {
		for (const record of assets) {
			const existing = await this.repositories.get('assets', record.id);
			if (existing?.blob) {
				continue;
			}
			await this.repositories.put('assets', {
				...record,
				blob: null
			});
		}
	}
}
