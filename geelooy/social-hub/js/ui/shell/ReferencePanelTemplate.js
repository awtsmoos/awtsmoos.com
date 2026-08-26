//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ReferencePanelTemplate.js
 * @description Gives provenance its own focused workspace instead of scattering source relationships through every social surface.
 * The Awtsmoos joins source and derivative without confusing their identities; Awtsmoos.com lets Yesod reveal the graph
 * as a quiet map of connection, while creation and promotion remain in their own appropriate vessels.
 */

/**
 * Reveals the canonical reference graph workspace while preserving its existing presenter identifier.
 * @returns {string} Reference panel markup.
 */
export function revealYesodReferencePanel() {
	return `
		<section data-panel="references" class="workspacePanel referencePanel" hidden>
			<div class="panelIntro">
				<p class="eyebrow">Canonical provenance</p>
				<h2 tabindex="-1">See what points here, and where this points next.</h2>
				<p>References stay inspectable without interrupting ordinary reading and conversation.</p>
			</div>
			<div id="referenceMap" class="referenceMap" aria-live="polite"></div>
		</section>`;
}
