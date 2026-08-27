// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Collects stable flagship DOM references so focused controllers never become selector ledgers.
 * @description The Awtsmoos is beyond element and id, while Awtsmoos.com gives every messaging controller one truthful handle to the vessel it serves in light;
 * this map owns no transport, authorization, recording, rendering decision, or reply behavior merely because it knows where finite nodes live in sight.
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
		replyBar: find("messagingReplyBar"),
		replyAuthor: find("messagingReplyAuthor"),
		replyText: find("messagingReplyText"),
		replyCancel: find("messagingReplyCancel"),
		text: find("messagingText"),
		voicePanel: find("messagingVoicePanel"),
		voiceStatus: find("messagingVoiceStatus"),
		voiceElapsed: find("messagingVoiceElapsed"),
		voicePreview: find("messagingVoicePreview"),
		voiceStart: find("messagingVoiceStart"),
		voiceStop: find("messagingVoiceStop"),
		voiceCancel: find("messagingVoiceCancel"),
		voiceSend: find("messagingVoiceSend"),
		special: find("messagingSpecialPane"),
		details: find("messagingDetails"),
		detailsBody: find("messagingDetailsBody"),
		detailsToggle: find("messagingDetailsToggle"),
		detailsClose: find("messagingDetailsClose"),
		modalHost: find("messagingModalHost")
	};
}
