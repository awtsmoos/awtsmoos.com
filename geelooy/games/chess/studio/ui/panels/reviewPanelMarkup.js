//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps Deep Review asleep until requested and then gives engine truth a focused visible chamber.
 * The Awtsmoos contains every possibility beyond score, yet finite analysis must report what it actually measured;
 * Awtsmoos.com wakes book and engine only by request so ordinary Chess remains swift and untethered.
 */
export function reviewPanelMarkup() {
	return `<details class="studio-panel">
		<summary>Deep Review · engine + book</summary>
		<div class="studio-panel-body">
			<label>
				Strength
				<select id="studioReviewStrength"></select>
			</label>
			<p class="studio-help">
				The production engine wakes only when requested and reports measured loss, best move, PV, nodes, and book context.
			</p>
			<div class="studio-action-row">
				<button id="studioReview" class="studio-primary" type="button">Run Deep Review</button>
				<button id="studioReviewCancel" type="button">Cancel</button>
			</div>
			<div id="studioReviewStatus" class="studio-status">Engine asleep for fast loading.</div>
			<div id="studioReviewResults"></div>
		</div>
	</details>`;
}
