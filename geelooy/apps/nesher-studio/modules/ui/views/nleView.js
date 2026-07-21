/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals time through focused chambers inside one editor; Awtsmoos.com makes every command reachable without turning the timeline into a scrolling hallway.
*/
export function nleView() {
	return `
		<section id="nleSection" class="workspace-page nle-page" data-studio-page="nle" hidden>
			<header class="page-kicker compact-kicker"><div><p class="eyebrow">Nonlinear time</p><h2>Timeline Editor</h2></div><button id="backToStudio">Back Home</button></header>
			<div class="nle-deck workspace-deck" data-workspace-deck="nleMain">
				<nav class="deck-tabs nle-main-tabs" data-deck-tabs><button data-deck-target="media">Media</button><button class="active" data-deck-target="timeline">Timeline</button><button data-deck-target="export">Export</button><button data-deck-target="benchmark">Bench</button></nav>
				<div class="deck-stack" data-deck-stack>
					<section id="nleMediaPanel" class="deck-panel nle-card" data-deck-panel="media" hidden><p class="eyebrow">Media bin</p><ol id="nleBin" class="compact-list"></ol><div class="list-pager" data-list-pager="nleBin" data-page-size="5"><button data-page-action="previous">←</button><span data-page-label>1 / 1</span><button data-page-action="next">→</button></div><button id="addBinAsset">Add Generated Asset</button></section>
					<section id="nleTimelinePanel" class="deck-panel timeline-section active" data-deck-panel="timeline"><ol id="nleTimeline"></ol><p id="nleSelectionSummary">No timeline clip selected.</p><div class="command-deck workspace-deck" data-workspace-deck="nleCommands"><nav class="deck-tabs command-tabs" data-deck-tabs><button class="active" data-deck-target="transport">Transport</button><button data-deck-target="edit">Edit</button><button data-deck-target="arrange">Arrange</button><button data-deck-target="state">State</button></nav><div class="deck-stack" data-deck-stack><div class="deck-panel nle-actions active" data-deck-panel="transport"><button id="nleJumpStart">⏮ Start</button><button id="nlePlayheadBack">◀ 1s</button><button id="nlePlayheadForward">1s ▶</button><button id="nleJumpEnd">End ⏭</button><button id="nleZoomOut">Zoom −</button><button id="nleZoomIn">Zoom +</button></div><div class="deck-panel nle-actions" data-deck-panel="edit" hidden><button id="addTimelineClip">Add Selected</button><button id="splitClip">Split</button><button id="trimClipShorter">Trim -1s</button><button id="duplicateClip">Duplicate</button><button id="rippleDeleteClip" class="danger-button">Ripple Delete</button></div><div class="deck-panel nle-actions" data-deck-panel="arrange" hidden><button id="nudgeClipLeft">Nudge -1s</button><button id="nudgeClipRight">Nudge +1s</button><button id="moveClipTrack">Move Track</button><button id="snapClipPrev">Snap Prev</button><button id="snapClipNext">Snap Next</button></div><div class="deck-panel nle-actions" data-deck-panel="state" hidden><button id="fadeClip">Fade</button><button id="toggleClipMute">Mute</button><button id="toggleClipDisabled">Disable</button><button id="addMarker">Marker</button></div></div></div></section>
					<section id="nleExportPanel" class="deck-panel nle-card" data-deck-panel="export" hidden><p class="eyebrow">WebCodecs export</p><h3>Render the arranged timeline</h3><p id="nleExport"></p><button id="prepareExport">Render MP4 Preview</button></section>
					<section id="benchmarkCard" class="deck-panel nle-card" data-deck-panel="benchmark" hidden><p class="eyebrow">Encoding benchmark</p><h3>Measure before committing</h3><div class="button-grid"><button id="runSmokeEncodingBenchmark">Fast Smoke</button><button id="runEncodingBenchmark">Full Run</button></div><pre id="encodingBenchmarkOutput">No benchmark yet.</pre></section>
				</div>
			</div>
		</section>
	`;
}
