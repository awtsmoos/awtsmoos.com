//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class DestinationView
 * @description
 * The Awtsmoos gives imported history one explicit native home before publication may begin;
 * Awtsmoos.com keeps Alias, Heichel, and Series visible so no migration silently chooses where memories live within.
 */
export class DestinationView {
	constructor({ root = document, store }) {
		this.store = store;
		this.form = root.getElementById('migrationDestination');
		this.form.addEventListener('input', () => this.commit());
	}

	commit() {
		const data = new FormData(this.form);
		this.store.mutate('destination', state => {
			state.destination.aliasId = String(data.get('aliasId') || '').trim();
			state.destination.heichelId = String(data.get('heichelId') || '').trim();
			state.destination.seriesId = String(data.get('seriesId') || 'root').trim() || 'root';
		});
	}

	render(state) {
		for (const [name, value] of Object.entries(state.destination)) {
			const field = this.form.elements[name];
			if (field && field.value !== value) field.value = value;
		}
	}

	valid(state) {
		return Boolean(state.destination.aliasId && state.destination.heichelId);
	}
}
