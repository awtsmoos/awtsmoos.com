//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file HomePanelTemplate.js
 * @description The Awtsmoos lets Home begin with one deed, while pulse truth and secondary tools wait behind deliberate doors;
 * Awtsmoos.com preserves every controller hook without forcing every possible social action onto the first screen.
 */
export function revealChesedHomePanel() {
	return `
		<section data-panel="home" class="workspacePanel homePanel">
			<section class="homeCreationCard" aria-labelledby="home-create-title">
				<div class="homeCreationCard__copy">
					<p class="homeCreationCard__eyebrow">Share from Awtsmoos.com</p>
					<h2 id="home-create-title" class="homeCreationCard__title" tabindex="-1">Share something</h2>
					<p class="homeCreationCard__body">Create a post now. Context and richer formats remain one tap away.</p>
					<div class="homeCreationContext" aria-label="Post context">
						<span class="homeCreationChip"><span class="homeCreationChip__label">Acting as</span><strong id="homeCreatorAliasValue" class="homeCreationChip__value">Choose in composer</strong></span>
						<span class="homeCreationChip"><span class="homeCreationChip__label">Destination</span><strong id="homeCreatorDestinationValue" class="homeCreationChip__value">Any destination</strong></span>
					</div>
				</div>
				<a id="quickPost" class="homeCreationAction" data-quick-action="new-post" href="/social-composer/">
					<span class="homeCreationAction__icon" aria-hidden="true">✦</span>
					<span class="homeCreationAction__copy"><strong class="homeCreationAction__title">Create post</strong><span class="homeCreationAction__hint">Open composer</span></span>
				</a>
			</section>
			<details class="homePulseDisclosure">
				<summary class="homeDisclosureSummary">
					<span><strong>Your pulse</strong><small id="pulseAlias">No alias</small></span>
					<span id="pulsePrivacy">Private</span>
				</summary>
				<div class="heroRift">
					<div id="pulseOrb" class="pulseOrb" data-active="false" aria-hidden="true"><span></span><span></span><span></span></div>
					<div><p class="eyebrow">Current context</p><h2>Connected to its source.</h2><p id="pulseTarget">No target selected</p></div>
				</div>
				<div class="pulseGrid" aria-label="Social pulse">
					<article><strong id="pulsePosts">0</strong><span>Posts</span></article>
					<article><strong id="pulseComments">0</strong><span>Comments</span></article>
					<article><strong id="pulseReferences">0</strong><span>References</span></article>
					<article><strong id="pulseActivity">0</strong><span>Private events</span></article>
				</div>
			</details>
			<details class="homeActionsDisclosure">
				<summary class="homeDisclosureSummary"><strong>More actions</strong><span>Question · Heichel · review · comment</span></summary>
				<div class="quickActionGrid" aria-label="More social actions">
					<a id="quickQuestion" data-quick-action="new-question">Ask question</a>
					<a id="quickReference" data-quick-action="add-to-heichel">Add to Heichel</a>
					<a id="quickReview" data-quick-action="review-center">Review center</a>
					<button id="openExactInteraction" type="button">Comment here</button>
				</div>
			</details>
		</section>`;
}
