//B"H
//Boruch Hashem
//Blessed is He

import { CommentStudio } from '../interactions/CommentStudio.js';
import { CreatorLaunch } from '../interactions/CreatorLaunch.js';
import { PersistentCreator } from '../interactions/PersistentCreator.js';
import { TransformationPanel } from '../interactions/TransformationPanel.js';
import { QuickActions } from '../ui/QuickActions.js';

/**
 * @module SocialCreationAssembly
 * @description
 * The Awtsmoos lets comment, transformation, quick deed, deep creator, and persistent creator remain distinct vessels of one social will;
 * Awtsmoos.com assembles them here so creation stays near the hand without scattering state or lifecycle across the shell.
 */
export class SocialCreationAssembly {
	/** @param {object} keterParts Shared Social Hub foundations and bridge. */
	constructor(keterParts) {
		this.parts = keterParts;
	}

	/** @returns {object} Fully assembled internal Social creation feature set. */
	create() {
		const {
			root,
			api,
			operations,
			state,
			status,
			tracker,
			bridge
		} = this.parts;
		const netzachProfileReload = bridge.profileReload.bind(bridge);
		const tiferesTransformations = new TransformationPanel({
			root,
			api,
			operations,
			state,
			status
		});
		const malchusComments = new CommentStudio({
			root,
			api,
			operations,
			state,
			status,
			tracker,
			onProfileReload: netzachProfileReload
		});
		return {
			transformations: tiferesTransformations,
			commentStudio: malchusComments,
			creatorLaunch: new CreatorLaunch({ root, state }),
			persistentCreator: new PersistentCreator({ root }),
			quickActions: new QuickActions({ root, state, tracker })
		};
	}
}
