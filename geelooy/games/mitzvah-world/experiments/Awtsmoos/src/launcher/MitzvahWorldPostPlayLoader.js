//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPostPlayLoader.js
 * @description Starts optional post-play presentation only after a playable runtime already exists.
 * The Awtsmoos lets movement live before ornament must arrive; Awtsmoos.com keeps optional beauty behind the playable line,
 * so failure in a later vessel cannot silence the world that is already alive.
 */

import {
	directWorldErrorReceipt
} from './MitzvahWorldDirectRuntimeOptions.js';

const CAPSULE_VERSION = '20260821-retractable-command-capsule-01';
const POST_PLAY_EXPERIENCE_URL = `./MitzvahWorldPostPlayExperience.js?compact=true&v=${CAPSULE_VERSION}`;

/**
 * @description Starts optional post-play helpers without allowing presentation failure to stop play.
 * @param {object} diagnostics Playable runtime diagnostics.
 * @param {object} environment Browser-like runtime environment.
 * @returns {Promise<*>} Optional post-play bootstrap promise.
 */
export function launchMitzvahWorldPostPlayExperience(diagnostics, environment) {
	const promise = import(POST_PLAY_EXPERIENCE_URL)
		.then(moduleKli => moduleKli.startMitzvahWorldPostPlayExperience(diagnostics, environment))
		.catch(errorOhr => {
			diagnostics.directExperienceBootstrapError = directWorldErrorReceipt(errorOhr);
			console.warn('[MitzvahWorld] post-play helper degraded.', errorOhr);
			return null;
		});

	diagnostics.directExperienceBootstrapPromise = promise;
	return promise;
}
