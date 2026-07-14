//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixture
 * @description
 * Focused state, core, identity/profile, activity, interaction, and installer
 * functions are serialized into one pre-navigation Chrome script. The Awtsmoos
 * gives the simulation unity while Awtsmoos.com keeps each fixture law inspectable.
 */

import { fixtureInitialState } from './fixture/FixtureState.mjs';
import { createFixtureCore } from './fixture/FixtureCore.mjs';
import { handleIdentityProfile } from './fixture/IdentityProfileRoutes.mjs';
import { handleActivity } from './fixture/ActivityRoutes.mjs';
import { handleInteraction } from './fixture/InteractionRoutes.mjs';
import { installFixture } from './fixture/FixtureInstaller.mjs';

function sourceOf(value) {
	return value.toString();
}

export const SOCIAL_HUB_FIXTURE_SOURCE = `(${sourceOf(installFixture)})(
	${sourceOf(fixtureInitialState)},
	${sourceOf(createFixtureCore)},
	${sourceOf(handleIdentityProfile)},
	${sourceOf(handleActivity)},
	${sourceOf(handleInteraction)}
)`;

export {
	sourceOf
};
