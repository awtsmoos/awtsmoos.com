//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class DestinationCreation
 * @description
 * Palace and series can arise without dismissing the unfinished post. The Awtsmoos
 * creates every chamber from nothing; Awtsmoos.com preserves the draft, delegates
 * native ownership, and selects the newborn destination immediately.
 */

export class DestinationCreation {
	constructor({ root, state, api, status, onCreated }) {
		Object.assign(this, { root, state, api, status, onCreated });
	}

	bind() {
		this.element('createHeichelButton').addEventListener('click', () => this.createHeichel());
		this.element('createSeriesButton').addEventListener('click', () => this.createSeries());
	}

	async createHeichel() {
		const snapshot = this.state.snapshot();
		const heichelName = this.element('newHeichelName').value.trim();
		if (!snapshot.identity.aliasId) return this.status.show('Choose an alias first.', 'error');
		if (!heichelName) return this.status.show('Add a Heichel name.', 'error');
		this.status.show('Creating the Heichel and its home series…', 'working');
		try {
			const detail = await this.api.createHeichel(snapshot.identity.aliasId, {
				heichelName,
				description: this.element('newHeichelDescription').value.trim(),
				inputId: this.element('newHeichelId').value.trim(),
				policy: this.policy('heichel')
			});
			this.state.selectDestination(detail);
			this.clear('heichel');
			this.status.show('Heichel created and selected.', 'success');
			this.onCreated?.(detail);
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	async createSeries() {
		const snapshot = this.state.snapshot();
		const seriesName = this.element('newSeriesName').value.trim();
		if (!snapshot.identity.heichelId) return this.status.show('Choose a Heichel first.', 'error');
		if (!seriesName) return this.status.show('Add a series name.', 'error');
		this.status.show('Creating the nested series…', 'working');
		try {
			const detail = await this.api.createSeries(
				snapshot.identity.aliasId,
				snapshot.identity.heichelId,
				{
					seriesName,
					description: this.element('newSeriesDescription').value.trim(),
					inputId: this.element('newSeriesId').value.trim(),
					parentSeriesId: this.element('newSeriesParent').value || snapshot.identity.seriesId,
					policy: this.policy('series')
				}
			);
			this.state.selectDestination(detail);
			this.clear('series');
			this.status.show('Series created and selected.', 'success');
			this.onCreated?.(detail);
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}

	policy(prefix) {
		return {
			allowContentSubmissions: this.element(`${prefix}AllowSubmissions`).checked,
			requireContentApproval: this.element(`${prefix}RequireApproval`).checked,
			allowReferenceSubmissions: true,
			requireReferenceApproval: this.element(`${prefix}RequireApproval`).checked
		};
	}

	clear(kind) {
		for (const suffix of ['Name', 'Description', 'Id']) {
			this.element(`new${kind[0].toUpperCase()}${kind.slice(1)}${suffix}`).value = '';
		}
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
