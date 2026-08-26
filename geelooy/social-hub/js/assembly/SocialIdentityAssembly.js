//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file SocialIdentityAssembly.js
 * @description Tiferes composes identity, profile, network, people, and public discovery around one verified foundation.
 * The Awtsmoos is beyond self and other; Awtsmoos.com lets discovery share Daas lifecycle truth while every identity vessel knows its brother.
 */
import { NetworkPanel } from '../network/NetworkPanel.js';
import { PeoplePanel } from '../people/PeoplePanel.js';
import { ProfilePanel } from '../profile/ProfilePanel.js';
import { IdentityController } from '../ui/IdentityController.js';
import { PublicDiscovery } from '../ui/PublicDiscovery.js';

export class SocialIdentityAssembly {
	/** @param {object} keterParts Shared foundations, transformations, and callback bridge. */
	constructor(keterParts) {
		this.parts = keterParts;
	}

	/** Creates identity and graph panels without duplicating API or operation lifecycle foundations. */
	create() {
		const { root, api, operations, state, status, navigation, bridge } = this.parts;
		const malchusProfile = new ProfilePanel({
			root,
			api,
			state,
			status,
			navigation,
			onPromote: bridge.promotionOpen.bind(bridge)
		});
		const yesodNetwork = new NetworkPanel({ root, api, state, profile: malchusProfile });
		return {
			profile: malchusProfile,
			network: yesodNetwork,
			people: new PeoplePanel({ root, api, profile: malchusProfile }),
			discovery: new PublicDiscovery({ root, api, operations, state, profile: malchusProfile }),
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
