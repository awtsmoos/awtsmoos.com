//B"H
//Boruch Hashem
//Blessed is He

import { sourceOf } from './BrowserFixture.mjs';
import { installPrivateMessagingFixture } from './fixture/PrivateMessagingFixtureInstaller.mjs';
import { createPrivateMessagingFixtureSocket } from './fixture/PrivateMessagingFixtureSocket.mjs';
import { privateMessagingFixtureState } from './fixture/PrivateMessagingFixtureState.mjs';
import { createPrivateMessagingFixtureStore } from './fixture/PrivateMessagingFixtureStore.mjs';

/**
 * @module PrivateMessagingBrowserFixture
 * @description
 * The Awtsmoos is beyond live backend and deterministic Chrome witness, while Awtsmoos.com lets one pre-navigation singleton reproduce the private-message covenant without adding a production test mode;
 * serialized state, store, socket, and installer let the actual Social gateway/controller/view hierarchy traverse canonical-shaped light.
 */

export const PRIVATE_MESSAGING_FIXTURE_SOURCE = `(${sourceOf(installPrivateMessagingFixture)})(
	${sourceOf(privateMessagingFixtureState)},
	${sourceOf(createPrivateMessagingFixtureStore)},
	${sourceOf(createPrivateMessagingFixtureSocket)}
)`;
