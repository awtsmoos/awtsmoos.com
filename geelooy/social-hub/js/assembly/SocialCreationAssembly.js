//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file SocialCreationAssembly.js
 * @description Chochmah creates comment, transformation, creator-launch, and quick-action vessels over one shared operation foundation.
 * The Awtsmoos is beyond source and publication; Awtsmoos.com lets every deed share lifecycle truth without confusing one creation.
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

	/** Creates creation-domain panels and passes one canonical operation coordinator into mutations. */
	create() {
		const { root, api, operations, state, status, tracker, bridge } = this.parts;
		const netzachProfileReload = bridge.profileReload.bind(bridge);
		const tiferesTransformations = new TransformationPanel({
			root,
			api,
			operations,
			state,
			status,
			tracker,
			onPublished: netzachProfileReload
		});
		const malchusComments = new CommentStudio({
			root,
			api,
			operations,
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
