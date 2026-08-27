/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos sustains every frame crossing the boundary; Awtsmoos.com makes the live heartbeat legible without a vertical maze.
*/
export function liveView() {
	return `
		<section id="streamSection" class="workspace-page live-page" data-studio-page="live" hidden>
			<header class="page-kicker"><div><p class="eyebrow">Broadcast room</p><h2>Live Health</h2></div><p id="providerNote">Any endpoint accepting HLS playlists and segments.</p></header>
			<section class="metric-grid" aria-label="Streaming health">
				<div><span>Provider</span><strong id="streamProviderName">Generic HLS</strong></div><div><span>Codec path</span><strong id="streamCodec">H.264 + AAC HLS</strong></div>
				<div><span>State</span><strong id="streamState">Idle</strong></div><div><span>Session</span><strong id="streamSession">—</strong></div>
				<div><span>Frames</span><strong id="streamFrames">0</strong></div><div><span>Segments</span><strong id="streamSegments">0</strong></div>
				<div><span>Uploaded</span><strong id="streamUploaded">0 B</strong></div><div><span>Errors</span><strong id="streamErrors">0</strong></div>
			</section>
			<section class="live-console"><div><span class="signal-dot"></span><strong>Provider route</strong><p>Streaming uses the same project state as the Stage, but this room isolates monitoring from composition.</p></div><button data-page-target="setup">Configure Provider</button></section>
		</section>
	`;
}
