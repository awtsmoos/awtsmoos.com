//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file SocialHubChromeTemplate.js
 * @description The Awtsmoos gives Social Hub one quiet crown and hides deeper coordinates until intention opens them;
 * Awtsmoos.com keeps every controller ID alive while route, alias, privacy, and command tools become one retractable vessel.
 */
export function revealKeterChrome() {
	return `
		<section class="hubHeader" aria-labelledby="hub-title">
			<div class="brandCluster">
				<div class="brandSigil" aria-hidden="true">א</div>
				<div>
					<p class="eyebrow">Awtsmoos.com · social</p>
					<h1 id="hub-title">Social Hub</h1>
					<p id="identityState">Verifying public aliases…</p>
				</div>
			</div>
			<details class="hubContextDisclosure">
				<summary class="hubContextDisclosure__summary">
					<strong id="workspaceTitle">Social pulse</strong>
					<span id="activeAliasBadge">No alias</span>
					<span class="hubContextDisclosure__chevron" aria-hidden="true">⌄</span>
				</summary>
				<div class="contextRibbon" aria-label="Current social context">
					<span id="activeDestinationBadge">No destination</span>
					<span id="activePrivacyBadge">Private activity</span>
				</div>
				<div class="identityCluster">
					<label>
						<span class="fieldLabelText">Act as</span>
						<select id="hubAliasSelect"><option value="">Choose public alias</option></select>
					</label>
					<a id="loginLink" class="identityPortal" href="/login"><span aria-hidden="true">◇</span><span>Log in</span></a>
				</div>
			</details>
		</section>`;
}

export function revealMalchusWorkspace(malchusPanels) {
	return `
		<div class="hubShell">
			<aside id="desktopRail" class="desktopRail" aria-label="Social Hub sections">
				<nav id="desktopNavigation" class="routeNavigation" aria-label="Desktop Social Hub navigation"></nav>
				<div class="railFooter"><span>Private by default</span><span>Awtsmoos social</span></div>
			</aside>
			<main class="workspace">${malchusPanels}</main>
		</div>
		<div id="mobileCreatorPortal" class="mobileCreatorPortal" aria-label="Create in Geelooy">
			<a id="mobileQuickPost" class="mobileCreatorAction" href="/social-composer/">
				<span class="mobileCreatorAction__icon" aria-hidden="true">✦</span>
				<span class="mobileCreatorAction__copy">
					<strong class="mobileCreatorAction__label">Create</strong>
					<span class="mobileCreatorAction__hint">New post</span>
				</span>
			</a>
		</div>
		<nav id="mobileNavigation" class="mobileDock routeNavigation" aria-label="Mobile Social Hub navigation"></nav>
		<p id="hubStatus" class="hubStatus" hidden aria-live="polite"></p>`;
}
