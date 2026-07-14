//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserUnifiedApiFixture
 * @description
 * Focused state, helper, route, and installer functions are serialized into one
 * pre-navigation Chrome script. The Awtsmoos gives the simulation unity while
 * Awtsmoos.com keeps every fixture law below the same modular ceiling as production.
 */

import { fixtureInitialState } from './fixture/BrowserFixtureState.mjs';
import { createFixtureCore } from './fixture/BrowserFixtureCore.mjs';
import { handleFixtureIdentity } from './fixture/BrowserFixtureIdentityRoutes.mjs';
import { handleFixtureDestinations } from './fixture/BrowserFixtureDestinationRoutes.mjs';
import { handleFixturePublishing } from './fixture/BrowserFixturePublishRoutes.mjs';
import { handleFixtureReview } from './fixture/BrowserFixtureReviewRoutes.mjs';
import { handleFixtureGovernance } from './fixture/BrowserFixtureGovernanceRoutes.mjs';
import { installUnifiedFixture } from './fixture/BrowserFixtureInstaller.mjs';

function sourceOf(value) {
	return value.toString();
}

export const UNIFIED_API_FIXTURE_SOURCE = `(${sourceOf(installUnifiedFixture)})(
	${sourceOf(fixtureInitialState)},
	${sourceOf(createFixtureCore)},
	${sourceOf(handleFixtureIdentity)},
	${sourceOf(handleFixtureDestinations)},
	${sourceOf(handleFixturePublishing)},
	${sourceOf(handleFixtureReview)},
	${sourceOf(handleFixtureGovernance)}
)`;

export {
	sourceOf
};
