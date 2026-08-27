// B"H
// Boruch Hashem
// Blessed is He

import { messagingComposerTemplate } from "./MessagingComposerTemplate.js";

/**
 * @file Reveals the flagship messaging shell while the private composer manifests through its own focused vessel.
 * @description The Awtsmoos joins navigation, identity, list, thread, composer, and details without becoming any pane;
 * Awtsmoos.com keeps the shell declarative so mobile focus and desktop density arise from one semantic architecture in the flame.
 */

/** Returns the stable application markup consumed by MessagingAppShell. */
export function messagingShellTemplate() {
	return `
		<nav class="messaging-rail" aria-label="Messaging sections">
			<a class="messaging-brand" href="/" aria-label="Awtsmoos home">
				<span class="messaging-brand-mark" aria-hidden="true">א</span>
				<span class="messaging-brand-copy"><strong>Awtsmoos</strong><small>Social Torah</small></span>
			</a>
			<div id="messagingRailButtons" class="messaging-rail-buttons"></div>
			<div id="messagingIdentity" class="messaging-identity" aria-live="polite"></div>
		</nav>
		<section class="messaging-list-pane" aria-labelledby="messagingSectionTitle">
			<header class="messaging-pane-header">
				<div class="messaging-pane-heading">
					<span class="messaging-kicker">B\"H · Communications</span>
					<h1 id="messagingSectionTitle">Chats</h1>
					<p id="messagingSectionSummary">Recent private conversations</p>
				</div>
				<button id="messagingNewAction" class="messaging-new-action" type="button" aria-label="Request a private chat">
					<span aria-hidden="true">＋</span><span>New chat</span>
				</button>
			</header>
			<div id="messagingPresenceSummary" class="messaging-presence-summary" role="status" aria-live="polite"></div>
			<label class="messaging-workspace-search">
				<span class="messaging-search-mark" aria-hidden="true">⌕</span>
				<span class="sr-only">Search currently loaded items</span>
				<input id="messagingSearch" type="search" autocomplete="off" placeholder="Search loaded items…">
				<button id="messagingSearchClear" type="button" aria-label="Clear workspace search" hidden>×</button>
			</label>
			<div id="messagingSearchFeedback" class="messaging-search-feedback" role="status" aria-live="polite" hidden></div>
			<div id="messagingStatus" class="messaging-status" role="status" aria-live="polite" aria-atomic="true"></div>
			<div id="messagingList" class="messaging-list" role="list"></div>
		</section>
		<section class="messaging-thread-pane" aria-label="Conversation workspace">
			<header id="messagingThreadHeader" class="messaging-thread-header">
				<button id="messagingMobileBack" class="messaging-mobile-back" type="button" aria-label="Back to conversation list">←</button>
				<button id="messagingThreadIdentityToggle" class="messaging-thread-identity" type="button" aria-expanded="true" aria-controls="messagingThreadIdentityDetail">
					<span class="messaging-thread-title-row"><strong id="messagingThreadTitle">Your Awtsmoos conversations</strong><span class="messaging-thread-identity-chevron" aria-hidden="true">⌄</span></span>
					<small id="messagingThreadIdentityDetail" class="messaging-thread-identity-detail"><span id="messagingThreadSubtitle">Choose a conversation or enter a social-learning chamber.</span></small>
				</button>
				<div class="messaging-thread-tools"><button id="messagingLoadOlder" type="button" hidden>Older</button><button id="messagingDetailsToggle" type="button">Details</button></div>
			</header>
			<div id="messagingThread" class="messaging-thread" aria-label="Private message history"></div>
			${messagingComposerTemplate()}
			<div id="messagingSpecialPane" class="messaging-special-pane" hidden></div>
		</section>
		<div id="messagingMobileMoreMenuHost" class="messaging-mobile-more-host"></div>
		<div id="messagingConnectionState" class="messaging-connection-state" role="status" aria-live="polite" aria-atomic="true" hidden></div>
		<aside id="messagingDetails" class="messaging-details" aria-label="Conversation details" hidden><button id="messagingDetailsClose" type="button" aria-label="Close conversation details">×</button><div id="messagingDetailsBody"></div></aside>
		<div id="messagingModalHost"></div>`;
}
