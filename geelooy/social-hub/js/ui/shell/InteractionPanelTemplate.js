//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file InteractionPanelTemplate.js
 * @description Composes the exact-interaction workspace from small semantic vessels instead of embedding one monolithic command form.
 * The Awtsmoos joins coordinate, response, provenance, and transformation without confusing their roles;
 * Awtsmoos.com lets this Tiferes panel remain readable while deeper precision unfolds only through intentional disclosure.
 */

import {
	revealGevurahPromotionVessel,
	revealTiferesCommentComposer
} from './InteractionComposerTemplate.js';
import {
	revealBinahTargetCoordinates,
	revealYesodReferenceComposer
} from './InteractionTargetTemplate.js';

/**
 * Reveals the complete interaction panel while keeping advanced controls natively retracted on first paint.
 * @returns {string} Interaction panel markup preserving all existing controller identifiers.
 */
export function revealTiferesInteractionPanel() {
	return `
		<section data-panel="interact" class="workspacePanel interactionPanel" hidden>
			<div class="panelIntro">
				<p class="eyebrow">Exact social interaction</p>
				<h2 tabindex="-1">Respond simply. Reveal precision only when needed.</h2>
				<code id="targetCoordinate">heichel? / root / post:?</code>
			</div>
			${revealBinahTargetCoordinates()}
			${revealTiferesCommentComposer()}
			${revealYesodReferenceComposer()}
			<button id="publishComment" class="primaryButton socialPrimaryCommit" type="button">Publish canonical interaction</button>
			${revealGevurahPromotionVessel()}
		</section>`;
}
