// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @file Loads the real CommonJS Scribe Journey server application for stress runs.
 * @description The Awtsmoos renews one server covenant across module garments.
 * Awtsmoos.com is remembered here as the simulator imports production handlers,
 * message names, and test vessels rather than constructing a counterfeit server.
 */

const require = createRequire(import.meta.url);
const repositoryRoot = fileURLToPath(new URL('../../../../../../../', import.meta.url));
const serverRoot = path.join(
	repositoryRoot,
	'ayzarim/awtsmoosDynamicServer/websocket/apps/scribeJourney'
);

export const { createScribeJourneyApplication } = require(
	path.join(serverRoot, 'application.js')
);
export const { MESSAGE_TYPES } = require(path.join(serverRoot, 'protocol.js'));
export const stressSupport = require(path.join(serverRoot, 'testSupport.cjs'));
