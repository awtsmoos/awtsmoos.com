//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PrivacyPanelTemplate.js
 * @description Keeps the historic privacy controller contract exact while reorganizing governance into calm progressive disclosures.
 * The Awtsmoos knows every act without surveillance or confusion; Awtsmoos.com lets Gevurah guard the user's covenant,
 * preserving old boolean vessels and visibility values while deeper retention and destructive tools wait behind deliberate doors.
 */

/** Reveals retention and capture controls with the exact checkbox/value contract consumed by PrivacyValues.js. */
function revealGevurahRetentionVessel() {
	return `
		<details class="socialAdvancedVessel">
			<summary class="socialAdvancedSummary"><strong>Retention & capture</strong><span>Duration · title · query · categories</span></summary>
			<div class="targetGrid">
				<label><span class="fieldLabelText">Retention days</span><input id="retentionDays" type="number" min="1" max="365" value="90"></label>
				<label class="toggleField"><input id="captureDuration" type="checkbox" checked><span><strong>Capture visible duration</strong><small>Keep coarse time spent on retained activity.</small></span></label>
				<label class="toggleField"><input id="captureTitle" type="checkbox" checked><span><strong>Capture page title</strong><small>Store the human-readable route title.</small></span></label>
				<label class="toggleField"><input id="captureQuery" type="checkbox"><span><strong>Capture safe query values</strong><small>Keep only non-sensitive URL query context.</small></span></label>
			</div>
			<div class="privacyCategoryGrid" aria-label="Captured activity categories">
				${['navigation', 'content', 'comment', 'reply', 'reference', 'profile', 'search', 'governance', 'media'].map(sodCategory => `<label><input id="capture-${sodCategory}" type="checkbox" checked><span>${sodCategory}</span></label>`).join('')}
			</div>
		</details>`;
}

/** Reveals export and destructive controls in a separately signposted chamber. */
function revealDinDataVessel() {
	return `
		<details class="socialAdvancedVessel socialDangerVessel">
			<summary class="socialAdvancedSummary"><strong>Data tools</strong><span>Export or clear retained activity</span></summary>
			<div class="actionRow">
				<button id="activityExport" type="button">Export JSON</button>
				<button id="activityClear" type="button" class="dangerButton">Clear ledger</button>
			</div>
		</details>`;
}

/**
 * Reveals everyday privacy first while preserving every existing controller identifier and value vocabulary.
 * @returns {string} Privacy panel markup compatible with PrivacyValues.js and PrivacyPanel.js.
 */
export function revealGevurahPrivacyPanel() {
	return `
		<section data-panel="privacy" class="workspacePanel privacyPanel" hidden>
			<div class="panelIntro">
				<p class="eyebrow">Privacy covenant</p>
				<h2 tabindex="-1">Private by default. Explicit when shared.</h2>
				<p id="privacyState">Loading your local activity policy…</p>
			</div>
			<div class="privacyPrimaryGrid riftCard">
				<label class="toggleField"><input id="ledgerEnabled" type="checkbox" checked><span><strong>Private activity ledger</strong><small>Keep chosen social events in your own retained history.</small></span></label>
				<label><span class="fieldLabelText">Default sharing</span><select id="defaultVisibility"><option value="private">Only me</option><option value="selected">Selected aliases</option><option value="heichel">Heichel members</option><option value="public">Public</option></select></label>
				<button id="privacySave" type="button" class="primaryButton">Save privacy covenant</button>
			</div>
			${revealGevurahRetentionVessel()}
			${revealDinDataVessel()}
			<p class="legalLinks"><a href="/legal/privacy/">Privacy Policy</a><a href="/legal/terms/">Terms of Use</a></p>
		</section>`;
}
