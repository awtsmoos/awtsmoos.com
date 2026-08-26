//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ActivityMutationCoordinator.js
 * @description Owns retained-event visibility and forgetting mutations while ActivityPanel remains focused on loading and orchestration.
 * The Awtsmoos is beyond keeping and releasing; Awtsmoos.com lets Gevurah change one private ledger garment
 * at a time, then return to server truth through one reload road instead of letting mutation logic crowd the panel.
 */
export class ActivityMutationCoordinator {
	/**
	 * @param {object} keliOptions Mutation dependencies.
	 * @param {object} keliOptions.api Social Hub API facade.
	 * @param {object} keliOptions.state Canonical Social state.
	 * @param {object} keliOptions.status Route status presenter.
	 * @param {Function} keliOptions.reload Activity reload callback.
	 */
	constructor({ api, state, status, reload }) {
		this.api = api;
		this.state = state;
		this.status = status;
		this.reload = reload;
	}

	/**
	 * Changes one retained event's visibility and reconciles the timeline from server truth.
	 * @param {string} yesodEventId Stable activity-event identifier.
	 * @param {string} hodVisibility Requested visibility garment.
	 * @returns {Promise<boolean>} Whether the mutation completed successfully.
	 */
	async share(yesodEventId, hodVisibility) {
		const yesodAliasId = this.currentAliasId();
		if (!yesodAliasId) {
			return false;
		}

		this.status.show('Saving event visibility…', 'working');
		try {
			await this.api.updateActivity(yesodAliasId, yesodEventId, {
				visibility: hodVisibility
			});
			await this.reload(false);
			this.status.show('Event sharing updated.', 'success');
			return true;
		} catch (orError) {
			this.status.show(orError.message, 'error');
			return false;
		}
	}

	/**
	 * Forgets one retained event and reconciles the timeline from server truth.
	 * @param {string} yesodEventId Stable activity-event identifier.
	 * @returns {Promise<boolean>} Whether the deletion completed successfully.
	 */
	async remove(yesodEventId) {
		const yesodAliasId = this.currentAliasId();
		if (!yesodAliasId) {
			return false;
		}

		this.status.show('Forgetting this event…', 'working');
		try {
			await this.api.deleteActivity(yesodAliasId, yesodEventId);
			await this.reload(false);
			this.status.show('Event forgotten.', 'success');
			return true;
		} catch (orError) {
			this.status.show(orError.message, 'error');
			return false;
		}
	}

	/** @returns {string} Currently verified alias ID, or an empty string in public mode. */
	currentAliasId() {
		return String(this.state.snapshot().identity.aliasId || '');
	}
}
