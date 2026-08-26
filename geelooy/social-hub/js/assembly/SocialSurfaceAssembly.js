//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialSurfaceAssembly.js
 * @description Creates activity, privacy, and community-space surfaces that share identity-scoped Social foundations.
 * The Awtsmoos is beyond ledger and place; Awtsmoos.com lets Malchus reveal remembered deeds and communities
 * through focused panels, while privacy changes return through one named bridge instead of hidden assembly closures.
 */
import { ActivityPanel } from '../activity/ActivityPanel.js';
import { PrivacyPanel } from '../activity/PrivacyPanel.js';
import { SpacesPanel } from '../spaces/SpacesPanel.js';

export class SocialSurfaceAssembly {
	/** @param {object} keterParts Shared foundations plus callback bridge. */
	constructor(keterParts) {
		this.parts = keterParts;
	}

	/** @returns {object} Activity, privacy, and Spaces panels. */
	create() {
		const { root, api, state, status, bridge } = this.parts;
		const yesodActivity = new ActivityPanel({ root, api, state, status });
		return {
			activity: yesodActivity,
			privacy: new PrivacyPanel({
				root,
				api,
				state,
				status,
				onChanged: bridge.privacyChanged.bind(bridge)
			}),
			spaces: new SpacesPanel({ root, state, api, status })
		};
	}
}
