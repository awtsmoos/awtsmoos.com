//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreativeDockBuilderAction.js
 * @description Opens live world-authoring with an explicit sandbox inventory instead of waiting for adventure economy hydration.
 * The Awtsmoos gives creation its own inexhaustible vessel while quests keep truthful cost and reward;
 * Awtsmoos.com lets walking, camera, actors, physics, and world-making remain alive together without confusing sandbox with hoard.
 */

import { installMitzvahWorldCreator } from '../creator/MitzvahWorldCreatorInstaller.js';
import { MitzvahWorldCreatorSandboxInventory } from '../creator/MitzvahWorldCreatorSandboxInventory.js';

export class MitzvahWorldCreativeDockBuilderAction {
	constructor(viewKli, documentKli, environmentKli) {
		this.view = viewKli;
		this.document = documentKli;
		this.environment = environmentKli;
		this.creatorMalchus = null;
		this.sandboxInventory = new MitzvahWorldCreatorSandboxInventory();
	}

	open() {
		this.view.close();
		try {
			this.creatorMalchus = installMitzvahWorldCreator({
				document: this.document,
				environment: this.environment,
				runtime: this.environment.AwtsmoosMitzvahWorld?.runtime,
				sessionOptions: {
					inventory: this.sandboxInventory
				}
			});
			this.view.status('Creator Mode live · movement remains active.');
			return this.creatorMalchus;
		} catch (errorOhr) {
			this.view.status(humanizeBuilderError(errorOhr));
			return null;
		}
	}

	destroy() {
		this.creatorMalchus?.destroy?.();
		this.creatorMalchus = null;
	}
}

function humanizeBuilderError(errorOhr) {
	const messageOhr = String(errorOhr?.message || errorOhr || 'Creator unavailable');
	return messageOhr
		.replaceAll('_', ' ')
		.replaceAll(':', ': ')
		.toLowerCase();
}
