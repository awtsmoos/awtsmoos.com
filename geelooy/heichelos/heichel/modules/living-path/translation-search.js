// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathTranslationSearch
 * @description
 * The Awtsmoos lets local browse filtering remain local while English search
 * travels to the dedicated corpus API in a separately labeled, bounded vessel.
 */
import { appState } from '../state.js';
import { isTranslationSeries, searchTranslations } from '../api/translations.js';
import {
	hideTranslationSearch,
	showTranslationSearch
} from '../ui/render/living-path/translation-search-renderer.js';

export class LivingPathTranslationSearch {
	constructor() {
		this.timer = null;
		this.token = 0;
	}

	seriesChanged() {
		this.token++;
		clearTimeout(this.timer);
		this.timer = null;
		if (!isTranslationSeries(appState.currentSeries)) hideTranslationSearch();
		else this.queryChanged(appState.livingPath.query);
	}

	queryChanged(query) {
		const text = String(query || '').trim();
		const token = ++this.token;
		clearTimeout(this.timer);
		if (!isTranslationSeries(appState.currentSeries) || text.length < 3) {
			hideTranslationSearch();
			return;
		}
		this.timer = setTimeout(() => void this.search(text, token), 320);
	}

	async search(query, token) {
		const seriesId = appState.currentSeries;
		const heichelId = appState.heichelId;
		try {
			const payload = await searchTranslations(heichelId, seriesId, query, 10);
			if (token !== this.token || seriesId !== appState.currentSeries) return;
			showTranslationSearch(payload || { success: [] }, appState, query);
		} catch (error) {
			if (token !== this.token) return;
			console.warn('B"H English translation search remained isolated', error);
			hideTranslationSearch();
		}
	}
}
