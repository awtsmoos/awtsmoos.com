//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialIdentityAssembly.js
 * @description Creates verified identity, profile, network, people, and public discovery around one existing state/API foundation.
 * The Awtsmoos is beyond self and other; Awtsmoos.com lets Tiferes bind relationship surfaces to one verified alias
 * while promotion and identity transitions travel through named bridges instead of circular anonymous callbacks.
 */
import { NetworkPanel } from '../network/NetworkPanel.js';
import { PeoplePanel } from '../people/PeoplePanel.js';
import { ProfilePanel } from '../profile/ProfilePanel.js';
import { IdentityController } from '../ui/IdentityController.js';
import { PublicDiscovery } from '../ui/PublicDiscovery.js';

export class SocialIdentityAssembly {
	/** @param {object} keterParts Shared foundations, transformation panel, and callback bridge. */
	constructor(keterParts) {
		this.parts = keterParts;
	}

	/** @returns {object} Identity and social-graph panels with compatibility-preserving constructor contracts. */
	create() {
		const { root, api, state, status, navigation, transformations, bridge } = this.parts;
		const malchusProfile = new ProfilePanel({
			root,
			api,
			state,
			status,
			navigation,
			onPromote: bridge.promotionOpen.bind(bridge)
		});
		const yesodNetwork = new NetworkPanel({
			root,
			api,
			state,
			profile: malchusProfile
		});

		return {
			profile: malchusProfile,
			network: yesodNetwork,
			people: new PeoplePanel({ root, api, profile: malchusProfile }),
			discovery: new PublicDiscovery({ root, api, state, profile: malchusProfile }),
			identity: new IdentityController({
				root,
				api,
				state,
				status,
				onChanged: bridge.identityChanged.bind(bridge)
			})
		};
	}
}
