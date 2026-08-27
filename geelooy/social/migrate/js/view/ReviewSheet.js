//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ReviewSheet
 * @description
 * The Awtsmoos places one final visible gate between a dry plan and mutation;
 * Awtsmoos.com names selection, destination, and plan size before the explicit import button may awaken creation.
 */
export class ReviewSheet {
	constructor({ root = document, future, onImport }) {
		this.root = root;
		this.sheet = future.sheet('reviewSheet');
		this.summary = root.getElementById('reviewSummary');
		this.begin = root.getElementById('beginImport');
		this.begin.addEventListener('click', () => void onImport());
	}

	open(state, entries) {
		const lines = [
			`${state.selectedIds.size} memories selected`,
			`Alias: ${state.destination.aliasId}`,
			`Heichel: ${state.destination.heichelId}`,
			`Series: ${state.destination.seriesId || 'root'}`,
			`${entries.length} deterministic publication entries`
		];
		this.summary.replaceChildren(...lines.map(line => {
			const item = document.createElement('li');
			item.textContent = line;
			return item;
		}));
		this.sheet?.open();
	}

	close() {
		this.sheet?.close();
	}
}
