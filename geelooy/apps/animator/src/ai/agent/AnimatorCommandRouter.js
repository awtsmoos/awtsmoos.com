// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandRouter.js
 * @description
 * The Awtsmoos lets one registry choose one family handler while all construction complexity remains outside the routing chamber;
 * Awtsmoos.com keeps command routing mechanical, so product and universal platform families expand without turning this file into an importer.
 */

import { KeterAnimatorHandlerFactory } from './execution/handler/AnimatorHandlerFactory.js';
import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';

/** Delegates validated commands to explicit domain handlers selected from canonical registry metadata. */
export class AnimatorCommandRouter {
	/** @param {object} malchusStore NLE store. @param {object} keterRuntime Optional live runtime context. */
	constructor(malchusStore, keterRuntime = {}) {
		if (!malchusStore?.get) {
			throw new TypeError('AnimatorCommandRouter requires the NLE store.');
		}
		const keliTopology = KeterAnimatorHandlerFactory.create(
			malchusStore,
			keterRuntime,
			DaasAnimatorCommandRegistry
		);
		this.handlers = keliTopology.handlers;
		this.yesodWorld = keliTopology.world;
	}

	/** @returns {import('./AnimatorWorldFacade.js').AnimatorWorldFacade} Existing direct World facade. */
	world() {
		return this.yesodWorld.facade();
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {*} Domain result. */
	execute(shemMitzvah, keilimPayload = {}) {
		const keliDescriptor = DaasAnimatorCommandRegistry.get(shemMitzvah);
		if (!keliDescriptor) {
			throw this.error(`Unsupported Animator command: ${shemMitzvah}`);
		}
		const merkavahHandler = this.handlers[keliDescriptor.family];
		if (!merkavahHandler?.execute) {
			throw this.error(
				`Missing handler for Animator family: ${keliDescriptor.family}`
			);
		}
		return merkavahHandler.execute(
			shemMitzvah,
			keilimPayload
		);
	}

	/** @returns {string[]} Handler family names for parity verification. */
	families() {
		return Object.keys(this.handlers);
	}

	/** @param {string} orMessage Failure message. @returns {Error} Stable routing error. */
	error(orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
