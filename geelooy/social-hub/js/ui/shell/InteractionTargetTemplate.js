//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file InteractionTargetTemplate.js
 * @description Keeps exact canonical coordinates near at hand while hiding their complexity behind one native disclosure.
 * The Awtsmoos knows every source and reply coordinate without burdening the first breath; Awtsmoos.com lets Binah reveal precision
 * only when intention needs it, preserving every historic controller ID while the ordinary composer remains beautifully simple.
 */

/**
 * Reveals the expert coordinate controls inside an initially retracted native details vessel.
 * @returns {string} Exact-target markup preserving all existing interaction field identifiers.
 */
export function revealBinahTargetCoordinates() {
	return `
		<details class="futureCoordinates socialAdvancedVessel">
			<summary class="futureCoordinates__summary socialAdvancedSummary">
				<strong>Exact target</strong>
				<span>Heichel · series · entity · verse · reply</span>
			</summary>
			<div class="targetGrid">
				<label><span class="fieldLabelText">Heichel</span><input id="commentHeichelId"></label>
				<label><span class="fieldLabelText">Series</span><input id="commentSeriesId" value="root"></label>
				<label><span class="fieldLabelText">Entity type</span><select id="commentEntityType"><option value="post">Post</option><option value="question">Question</option><option value="answer">Answer</option></select></label>
				<label><span class="fieldLabelText">Entity ID</span><input id="commentEntityId"></label>
				<label><span class="fieldLabelText">Verse</span><input id="commentVerseSection" value="root"></label>
				<label><span class="fieldLabelText">Subsection</span><input id="commentSubsectionId"></label>
				<label><span class="fieldLabelText">Reply to comment</span><input id="commentParentId"></label>
				<label><span class="fieldLabelText">Reply section</span><input id="commentParentSectionId"></label>
			</div>
		</details>`;
}

/**
 * Reveals canonical-reference controls as an optional provenance chamber.
 * @returns {string} Reference composer markup preserving legacy IDs.
 */
export function revealYesodReferenceComposer() {
	return `
		<details class="referenceComposer socialAdvancedVessel">
			<summary class="socialAdvancedSummary"><strong>Reference a source</strong><span>Attach canonical provenance</span></summary>
			<div class="targetGrid">
				<label><span class="fieldLabelText">Kind</span><select id="referenceKind"><option value="post">Post</option><option value="quote">Quote</option><option value="answer">Answer</option></select></label>
				<label><span class="fieldLabelText">Type</span><select id="referenceEntityType"><option value="post">Post</option><option value="question">Question</option><option value="answer">Answer</option></select></label>
				<label><span class="fieldLabelText">Entity ID</span><input id="referenceEntityId"></label>
				<label><span class="fieldLabelText">Source Heichel</span><input id="referenceHeichelId"></label>
				<label><span class="fieldLabelText">Source series</span><input id="referenceSeriesId" value="root"></label>
				<label><span class="fieldLabelText">Source section</span><input id="referenceSectionId"></label>
				<label><span class="fieldLabelText">Label</span><input id="referenceLabel"></label>
			</div>
		</details>`;
}
