//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class PrivacyActions
 * @description
 * Saving, exporting, and clearing private activity remain one mutation boundary.
 * The Awtsmoos gives every memory its source while Awtsmoos.com lets its owner
 * preserve, carry away, pause, or erase the finite record through verified routes.
 */

export class PrivacyActions {
	constructor({ api, state, status, onChanged, value }) {
		Object.assign(this, { api, state, status, onChanged, value });
	}

	async save() {
		const aliasId = this.state.snapshot().identity.aliasId;
		if (!aliasId) return null;
		this.status.show('Saving private activity controls…', 'working');
		try {
			const preferences = await this.api.savePreferences(aliasId, this.value());
			this.state.set('preferences', preferences);
			this.onChanged?.(preferences);
			this.status.show('Privacy controls saved.', 'success');
			return preferences;
		} catch (error) {
			this.status.show(error.message, 'error');
			return null;
		}
	}

	async export() {
		const aliasId = this.state.snapshot().identity.aliasId;
		if (!aliasId) return null;
		try {
			const data = await this.api.exportActivity(aliasId);
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: 'application/json'
			});
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `awtsmoos-activity-${aliasId}.json`;
			link.click();
			URL.revokeObjectURL(link.href);
			this.status.show('Private activity export prepared.', 'success');
			return data;
		} catch (error) {
			this.status.show(error.message, 'error');
			return null;
		}
	}

	async clear() {
		const aliasId = this.state.snapshot().identity.aliasId;
		if (!aliasId) return false;
		this.status.show('Clearing retained activity…', 'working');
		try {
			await this.api.clearActivity(aliasId);
			this.state.set('activity', []);
			this.onChanged?.(this.state.snapshot().preferences);
			this.status.show('Activity ledger cleared.', 'success');
			return true;
		} catch (error) {
			this.status.show(error.message, 'error');
			return false;
		}
	}
}
