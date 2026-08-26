//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HomePanelTemplate.js
 * @description Reveals the calm first horizon of Social Hub: identity, pulse, and a handful of primary intentions.
 * The Awtsmoos contains infinite relation without crowding the first glance; Awtsmoos.com lets Chesed offer clear doors,
 * while exact coordinates and specialist machinery remain deeper vessels entered only when the user chooses their light.
 */

/**
 * Reveals the primary Social Hub home panel while preserving every legacy pulse and quick-action identifier.
 * @returns {string} Home panel markup.
 */
export function revealChesedHomePanel() {
	return `
		<section data-panel="home" class="workspacePanel homePanel">
			<div class="heroRift">
				<div id="pulseOrb" class="pulseOrb" data-active="false" aria-hidden="true"><span></span><span></span><span></span></div>
				<div>
					<p class="eyebrow">Current social constellation</p>
					<h2 tabindex="-1">Everything remains connected to its source.</h2>
					<p id="pulseTarget">No target selected</p>
				</div>
			</div>
			<div class="pulseGrid" aria-label="Social pulse">
				<article><strong id="pulseAlias">No alias</strong><span>Active identity</span></article>
				<article><strong id="pulsePosts">0</strong><span>Posts</span></article>
				<article><strong id="pulseComments">0</strong><span>Comments</span></article>
				<article><strong id="pulseReferences">0</strong><span>References</span></article>
				<article><strong id="pulseActivity">0</strong><span>Private events</span></article>
				<article><strong id="pulsePrivacy">Private</strong><span>Activity default</span></article>
			</div>
			<div class="quickActionGrid" aria-label="Primary social actions">
				<a id="quickPost" data-quick-action="new-post">Create post</a>
				<a id="quickQuestion" data-quick-action="new-question">Ask question</a>
				<a id="quickReference" data-quick-action="add-to-heichel">Add to Heichel</a>
				<a id="quickReview" data-quick-action="review-center">Review center</a>
				<button id="openExactInteraction" type="button">Comment exactly here</button>
			</div>
		</section>`;
}
