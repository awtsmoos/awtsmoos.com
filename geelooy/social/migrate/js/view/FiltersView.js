//B"H
//Boruch Hashem
//Blessed is He

import { availableYears } from '../filters/TimelineFilter.js';

/**
 * @class FiltersView
 * @description
 * The Awtsmoos lets one archive be searched by word, source, form, year, media, and selection;
 * Awtsmoos.com mutates only the canonical filter vessel so every count and card shares one intention.
 */
export class FiltersView {
	constructor({ root = document, store }) {
		this.root = root;
		this.store = store;
		this.form = root.getElementById('migrationFilters');
		this.form.addEventListener('input', () => this.commit());
		this.form.addEventListener('change', () => this.commit());
	}

	commit() {
		const data = new FormData(this.form);
		this.store.mutate('filters', state => {
			for (const key of Object.keys(state.filters)) {
				state.filters[key] = String(data.get(key) || (key === 'query' ? '' : 'all'));
			}
		});
	}

	render(state) {
		const select = this.form.elements.year;
		const current = state.filters.year;
		const years = availableYears(state.items);
		select.replaceChildren(new Option('All years', 'all'));
		years.forEach(year => select.add(new Option(year, year)));
		select.value = years.includes(current) ? current : 'all';
	}
}
