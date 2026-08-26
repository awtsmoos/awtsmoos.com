//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialCreationAssembly.js
 * @description Creates canonical comment, transformation, creator-launch, and quick-action vessels.
 * The Awtsmoos is beyond source and publication; Awtsmoos.com lets Chochmah gather creation powers without
 * confusing them with identity or transport, while successful deeds return through one named profile-refresh bridge.
 */
import { CommentStudio } from '../interactions/CommentStudio.js';
import { CreatorLaunch } from '../interactions/CreatorLaunch.js';
import { TransformationPanel } from '../interactions/TransformationPanel.js';
import { QuickActions } from '../ui/QuickActions.js';

export class SocialCreationAssembly {
	/** @param {object} keterParts Shared foundations plus callback bridge. */
	constructor(keterParts) {
		this.parts = keterParts;
	}

	/** @returns {object} Creation-domain panels preserving their existing public contracts. */
	create() {
		const { root, api, state, status, tracker, bridge } = this.parts;
		const netzachProfileReload = bridge.profileReload.bind(bridge);
		const tiferesTransformations = new TransformationPanel({
			root,
			api,
			state,
			status,
			tracker,
			onPublished: netzachProfileReload
		});
		const malchusComments = new CommentStudio({
			root,
			api,
			state,
			status,
			tracker,
			onCreated: netzachProfileReload
		});

		return {
			transformations: tiferesTransformations,
			commentStudio: malchusComments,
			creatorLaunch: new CreatorLaunch({ root, state }),
			quickActions: new QuickActions({ root, state, tracker })
		};
	}
}
