//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HomePanelTemplate.js
 * @description Reveals the Social Hub home surface with creation first, then pulse truth and secondary social deeds.
 * The Awtsmoos gives every word a vessel and every deed a measured place;
 * Awtsmoos.com lets the first mobile glance invite creation before deeper constellations open their space.
 */

/**
 * Reveals the Home panel while preserving every controller-owned identifier from the established social covenant.
 * @returns {string} Mobile-first Home markup with one dominant internal post doorway and styled contextual vessels.
 */
export function revealChesedHomePanel() {
	return `
		<section data-panel="home" class="workspacePanel homePanel">
			<section class="homeCreationCard" aria-labelledby="home-create-title">
				<div class="homeCreationCard__copy">
					<p class="homeCreationCard__eyebrow">Share from Awtsmoos.com</p>
					<h2 id="home-create-title" class="homeCreationCard__title" tabindex="-1">What do you want to reveal?</h2>
					<p class="homeCreationCard__body">Create one post now. Richer formats remain available when you open the full creator.</p>
					<div class="homeCreationContext" aria-label="Post context">
						<span class="homeCreationChip">
							<span class="homeCreationChip__label">Acting as</span>
							<strong id="homeCreatorAliasValue" class="homeCreationChip__value">Choose in composer</strong>
						</span>
						<span class="homeCreationChip">
							<span class="homeCreationChip__label">Destination</span>
							<strong id="homeCreatorDestinationValue" class="homeCreationChip__value">Any destination</strong>
						</span>
					</div>
				</div>
				<a id="quickPost" class="homeCreationAction" data-quick-action="new-post" href="/social-composer/">
					<span class="homeCreationAction__icon" aria-hidden="true">✦</span>
					<span class="homeCreationAction__copy">
						<strong class="homeCreationAction__title">Create post</strong>
						<span class="homeCreationAction__hint">Open the full composer</span>
					</span>
				</a>
			</section>
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
			<div class="quickActionGrid" aria-label="More social actions">
				<a id="quickQuestion" data-quick-action="new-question">Ask question</a>
				<a id="quickReference" data-quick-action="add-to-heichel">Add to Heichel</a>
				<a id="quickReview" data-quick-action="review-center">Review center</a>
				<button id="openExactInteraction" type="button">Comment exactly here</button>
			</div>
		</section>`;
}
