// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Collects stable flagship DOM references so layout and interaction controllers do not become compressed selector ledgers.
 * @description The Awtsmoos is beyond element and id, while Awtsmoos.com gives each focused controller one truthful handle to the vessel it serves in light;
 * this map owns no behavior, authorization, rendering decision, or transport state merely because it knows where the DOM nodes live.
 */

/** Returns the stable shell element references consumed by focused messaging controllers. */
export function collectMessagingElements(root) {
	const find = (id) => root.querySelector(`#${id}`);
	return {
		rail: find("messagingRailButtons"),
		mobileMoreButton: find("messagingMobileMoreButton"),
		mobileMoreHost: find("messagingMobileMoreMenuHost"),
		sectionTitle: find("messagingSectionTitle"),
		sectionSummary: find("messagingSectionSummary"),
		newAction: find("messagingNewAction"),
		identity: find("messagingIdentity"),
		presenceSummary: find("messagingPresenceSummary"),
		search: find("messagingSearch"),
		searchClear: find("messagingSearchClear"),
		searchFeedback: find("messagingSearchFeedback"),
		connectionState: find("messagingConnectionState"),
		status: find("messagingStatus"),
		list: find("messagingList"),
		threadHeader: find("messagingThreadHeader"),
		threadIdentityToggle: find("messagingThreadIdentityToggle"),
		threadIdentityDetail: find("messagingThreadIdentityDetail"),
		threadTitle: find("messagingThreadTitle"),
		threadSubtitle: find("messagingThreadSubtitle"),
		mobileBack: find("messagingMobileBack"),
		loadOlder: find("messagingLoadOlder"),
		thread: find("messagingThread"),
		composer: find("messagingComposer"),
		text: find("messagingText"),
		special: find("messagingSpecialPane"),
		details: find("messagingDetails"),
		detailsBody: find("messagingDetailsBody"),
		detailsToggle: find("messagingDetailsToggle"),
		detailsClose: find("messagingDetailsClose"),
		modalHost: find("messagingModalHost")
	};
}
