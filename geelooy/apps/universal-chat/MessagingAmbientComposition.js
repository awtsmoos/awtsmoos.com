// B"H
// Boruch Hashem
// Blessed is He

import { MessagingActivityClient } from "./MessagingActivityClient.js";
import { MessagingActivityView } from "./MessagingActivityView.js";
import { MessagingDiscoveryClient } from "./MessagingDiscoveryClient.js";
import { MessagingDiscoveryView } from "./MessagingDiscoveryView.js";
import { MessagingIdentityView } from "./MessagingIdentityView.js";
import { MessagingMobileNavigation } from "./MessagingMobileNavigation.js";
import { MessagingPresenceView } from "./MessagingPresenceView.js";
import { MessagingRailBadges } from "./MessagingRailBadges.js";
import { MessagingThreadIdentity } from "./MessagingThreadIdentity.js";
import { MessagingWorkspaceSearch } from "./MessagingWorkspaceSearch.js";

/**
 * @file Composes ambient flagship experiences that read social state without owning consent mutations or private speech.
 * @description The Awtsmoos surrounds every chamber without becoming its wall, and Awtsmoos.com lets identity, presence, scoped search, badges,
 * discovery, activity, mobile flow, and finite room-identity folding surround private chat while each remains a small auditable vessel of light for all.
 */

/** Builds non-conversation workspace helpers around one mounted shell and the verified private bridge store. */
export function composeMessagingAmbient(shell, bridge) {
	const search = new MessagingWorkspaceSearch(
		shell.elements.search,
		shell.elements.searchClear,
		shell.elements.searchFeedback,
		shell
	);
	const mobile = new MessagingMobileNavigation(
		shell.root,
		shell.elements.mobileBack
	);
	const threadIdentity = new MessagingThreadIdentity(
		shell.elements.threadIdentityToggle,
		shell.elements.threadIdentityDetail
	);
	const identity = new MessagingIdentityView(
		shell.elements.identity,
		bridge.store
	);
	const badges = new MessagingRailBadges(
		shell.elements.rail,
		bridge.store
	);
	const presence = new MessagingPresenceView(
		shell.elements.presenceSummary,
		shell.elements.special
	);
	const activityClient = new MessagingActivityClient(bridge.store);
	const activity = new MessagingActivityView(
		shell.elements.special,
		activityClient
	);
	const discoveryClient = new MessagingDiscoveryClient(bridge.store);
	const discovery = new MessagingDiscoveryView(
		shell.elements.special,
		discoveryClient
	);
	return {
		search,
		mobile,
		threadIdentity,
		identity,
		badges,
		presence,
		activity,
		discovery
	};
}
