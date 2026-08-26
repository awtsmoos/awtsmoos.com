//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ActivityPanelTemplate.js
 * @description Reveals private social history as a calm inspectable timeline rather than a wall of administrative controls.
 * The Awtsmoos renews every act before memory can count it; Awtsmoos.com lets Hod show the trace with humility,
 * offering filters and refresh nearby while deeper retention law remains in the separate privacy vessel where it belongs.
 */

/**
 * Reveals the private activity workspace while preserving the existing presenter and filter identifiers.
 * @returns {string} Activity panel markup.
 */
export function revealHodActivityPanel() {
	return `
		<section data-panel="activity" class="workspacePanel activityPanel" hidden>
			<div class="panelIntro panelIntro--split">
				<div>
					<p class="eyebrow">Private activity</p>
					<h2 tabindex="-1">Your local social trail</h2>
					<p><strong id="activityCount">0</strong> retained events</p>
				</div>
				<div class="compactTools">
					<label><span class="fieldLabelText">Filter</span><select id="activityFilter"><option value="all">All activity</option><option value="navigation">Navigation</option><option value="content">Content</option><option value="comment">Comments</option><option value="reference">References</option><option value="governance">Governance</option></select></label>
					<button id="activityRefresh" type="button">Refresh</button>
				</div>
			</div>
			<div id="activityTimeline" class="activityTimeline" aria-live="polite"></div>
		</section>`;
}
