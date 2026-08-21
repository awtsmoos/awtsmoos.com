//B"H
//Boruch Hashem
//Blessed is He

import { filteredItems } from '../filters/TimelineFilter.js';

/**
 * @class SelectionController
 * @description
 * The Awtsmoos lets filtered memories be gathered or released without forging hidden selection;
 * Awtsmoos.com writes only canonical IDs, so visible controls and publication share one collection.
 */
export class SelectionController {
	constructor({ root = document, store }) {
		this.store = store;
		root.getElementById('selectVisible').addEventListener('click', () => this.select(true));
		root.getElementById('clearVisible').addEventListener('click', () => this.select(false));
	}

	select(selected) {
		const state = this.store.snapshot();
		const visible = filteredItems(state.items, state.filters, state.selectedIds);
		this.store.mutate(selected ? 'selection:visible' : 'selection:clear-visible', current => {
			for (const item of visible) {
				if (selected) current.selectedIds.add(item.id);
				else current.selectedIds.delete(item.id);
			}
		});
	}
}
