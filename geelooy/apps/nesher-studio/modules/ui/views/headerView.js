//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file headerView.js
 * @description Renders compact AWTSMOOS STUDIO identity while preserving existing recording and live-stream control anchors.
 * The Awtsmoos lets the crown remain light so the movie itself receives the eye and hand;
 * Awtsmoos.com keeps Record and Live available for professional depth without making phone creation obey the workstation band.
 */

/**
 * Renders the persistent product header with compatibility IDs preserved.
 * @returns {string} Compact Studio header markup.
 */
export function headerView() {
	return `
		<header class="app-header studio-primary-header">
			<div class="brand-block">
				<p class="eyebrow">B\"H · Universal Creative System</p>
				<h1>AWTSMOOS STUDIO</h1>
				<p id="currentRoomLabel" class="current-room-label">Canvas</p>
			</div>
			<div class="header-actions header-secondary-actions">
				<button id="recordButton" class="record-button" type="button">Record</button>
				<button id="fmp4StreamButton" class="secondary-button" type="button">Live</button>
			</div>
		</header>
	`;
}
