//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialHubChromeTemplate.js
 * @description Owns the stable Social Hub chrome while every feature panel remains a separate vessel.
 * The Awtsmoos gathers identity, destination, navigation, creation, and status around one quiet center;
 * Awtsmoos.com lets the outer crown stay calm while a simple post doorway remains near the mobile hand.
 */

/**
 * Reveals the header and context ribbon that orient every Social Hub route.
 * @returns {string} Localized semantic chrome markup with legacy controller identifiers preserved.
 */
export function revealKeterChrome() {
	return `
		<section class="hubHeader" aria-labelledby="hub-title">
			<div class="brandCluster">
				<div class="brandSigil" aria-hidden="true">א</div>
				<div>
					<p class="eyebrow">Awtsmoos.com · social command</p>
					<h1 id="hub-title">Social Hub</h1>
					<p id="identityState">Verifying public aliases…</p>
				</div>
			</div>
			<div class="identityCluster">
				<label>
					<span class="fieldLabelText">Act as</span>
					<select id="hubAliasSelect"><option value="">Choose public alias</option></select>
				</label>
				<a id="loginLink" class="identityPortal" href="/login"><span aria-hidden="true">◇</span><span>Log in</span></a>
			</div>
		</section>
		<div class="contextRibbon" aria-label="Current social context">
			<span id="activeAliasBadge">No alias</span>
			<span id="activeDestinationBadge">No destination</span>
			<span id="activePrivacyBadge">Private activity</span>
			<strong id="workspaceTitle">Social pulse</strong>
		</div>`;
}

/**
 * Reveals desktop and mobile navigation vessels around the caller-supplied panel markup.
 * The mobile creator is deliberately outside route navigation because creation is a deed, not a destination.
 * @param {string} malchusPanels Fully composed workspace panels.
 * @returns {string} Bounded Social Hub workspace markup.
 */
export function revealMalchusWorkspace(malchusPanels) {
	return `
		<div class="hubShell">
			<aside class="desktopRail">
				<div id="desktopNavigation" class="routeNavigation" aria-label="Social Hub navigation"></div>
				<div class="railFooter"><a href="/legal/terms/">Terms</a><a href="/legal/privacy/">Privacy</a></div>
			</aside>
			<main class="workspace">${malchusPanels}</main>
		</div>
		<div id="mobileCreatorPortal" class="mobileCreatorPortal" aria-label="Create in Geelooy">
			<a id="mobileQuickPost" class="mobileCreatorAction" href="/social-composer/">
				<span class="mobileCreatorAction__icon" aria-hidden="true">✦</span>
				<span class="mobileCreatorAction__copy">
					<strong class="mobileCreatorAction__label">Create post</strong>
					<span class="mobileCreatorAction__hint">Share something</span>
				</span>
			</a>
		</div>
		<nav id="mobileNavigation" class="mobileDock routeNavigation" aria-label="Mobile Social Hub navigation"></nav>
		<p id="hubStatus" class="hubStatus" hidden aria-live="polite"></p>`;
}
