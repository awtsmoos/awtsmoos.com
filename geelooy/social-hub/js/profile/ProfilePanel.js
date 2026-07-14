//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ProfilePanel
 * @description
 * Profile identity selection and server loading remain separate from canonical card
 * rendering. The Awtsmoos knows the complete person while Awtsmoos.com fetches one
 * visibility-filtered profile response and delegates every visible constellation.
 */

import { ProfileRenderer } from './ProfileRenderer.js';

export class ProfilePanel {
	constructor({ root, api, state, status, onPromote }) {
		Object.assign(this, { root, api, state, status, onPromote });
		this.renderer = new ProfileRenderer({ root, state, onPromote });
	}

	initialize() {
		this.element('profileLoad').addEventListener('click', () => {
			void this.load(true);
		});
		this.element('profileAliasId').addEventListener('keydown', event => {
			if (event.key === 'Enter') void this.load(true);
		});
	}

	async load(announce = false) {
		const snapshot = this.state.snapshot();
		const profileAliasId = this.element('profileAliasId').value.trim()
			|| snapshot.profileAliasId
			|| snapshot.identity.aliasId;
		if (!profileAliasId) return null;
		if (announce) this.status.show('Tracing the profile constellation…', 'working');
		try {
			const profile = await this.api.profile(
				profileAliasId,
				snapshot.identity.aliasId
			);
			this.state.mutate('profile:loaded', value => {
				value.profileAliasId = profileAliasId;
				value.profile = profile;
			});
			this.renderer.render(profile);
			if (announce) this.status.show('Profile constellation loaded.', 'success');
			return profile;
		} catch (error) {
			this.status.show(error.message, 'error');
			return null;
		}
	}

	render(profile) {
		this.renderer.render(profile);
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
