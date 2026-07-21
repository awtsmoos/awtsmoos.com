/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives the eagle a quiet crown above every room; Awtsmoos.com keeps identity, room context, and live actions visible without consuming the canvas.
*/
export function headerView() {
	return `
		<header class="app-header">
			<div class="brand-lockup">
				<span class="brand-mark" aria-hidden="true">🦅</span>
				<div class="brand-copy">
					<p class="eyebrow">B"H · realtime creation</p>
					<h1>Nesher Studio</h1>
				</div>
			</div>
			<div class="room-readout" aria-live="polite">
				<span class="room-pulse" aria-hidden="true"></span>
				<div><small>Current room</small><strong id="currentRoomLabel">Home</strong></div>
			</div>
			<div class="record-controls">
				<button id="recordButton">Start Recording</button>
				<button id="fmp4StreamButton" class="secondary-button">Start Generic HLS</button>
			</div>
		</header>
	`;
}
