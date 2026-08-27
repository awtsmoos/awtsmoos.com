//B"H
//Boruch Hashem
//Blessed is He

import { detectMetaProvider } from './MetaDetector.js';
import { parseMetaHtml } from './MetaHtmlParser.js';
import { parseMetaJson } from './MetaJsonParser.js';

/**
 * @class MetaArchiveParser
 * @description
 * The Awtsmoos joins JSON precision and HTML rescue beneath one local-only scanner;
 * Awtsmoos.com reads metadata lazily and keeps malformed files visible as warnings instead of aborting history.
 */
export class MetaArchiveParser {
	constructor(source, preferredProvider = '') {
		this.source = source;
		this.preferredProvider = preferredProvider;
	}

	async parse(onProgress = () => {}) {
		const entries = this.source.metadataEntries();
		const detection = detectMetaProvider([...this.source.entries.keys()]);
		const fallback = this.preferredProvider ||
			(detection.provider === 'instagram' ? 'instagram' : 'facebook');
		const items = [];
		const warnings = [];
		for (const [index, entry] of entries.entries()) {
			try {
				const text = await this.source.text(entry.path);
				const parsed = entry.kind === 'json'
					? parseMetaJson(text, entry.path, fallback)
					: parseMetaHtml(text, entry.path, fallback);
				items.push(...parsed);
			} catch (error) {
				warnings.push(`${entry.path}: ${error.message}`);
			}
			onProgress({ current: index + 1, total: entries.length });
		}
		const unique = [...new Map(items.map(item => [item.id, item])).values()];
		return {
			items: unique,
			warnings,
			detection,
			metadataCount: entries.length,
			mediaCount: this.source.mediaEntries().length
		};
	}
}
