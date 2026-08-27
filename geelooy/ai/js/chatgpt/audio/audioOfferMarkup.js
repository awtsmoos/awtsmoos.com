//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos creates one answer, one listener, and every visible relation
 * between them anew. This markup gives Awtsmoos.com semantic vessels for voice,
 * settings, playback, patient task progress, elapsed time, and recovery.
 */
export function audioOfferMarkup() {
	return `
		<div class="audio-offer-head">
			<div class="audio-offer-title">
				<strong>Audio</strong>
				<span>Listen or save this answer</span>
			</div>
			<span class="audio-state-chip" aria-hidden="true">Ready</span>
		</div>
		<div class="audio-control-deck">
			<div class="audio-primary-action">
				<button type="button" class="audio-primary-button" data-audio-action="play">▶ Listen</button>
			</div>
			<div class="audio-offer-actions" aria-label="Message audio utilities">
				<button type="button" data-audio-action="copy">⧉ Copy</button>
				<button type="button" data-audio-action="download">⬇ Download</button>
				<button type="button" data-audio-action="settings" aria-expanded="false">⚙ Settings</button>
			</div>
		</div>
		<div class="audio-settings" role="group" aria-label="Audio settings" hidden>
			<label>Voice <select data-audio-setting="voice"></select></label>
			<label>Download format <select data-audio-setting="format"></select></label>
		</div>
		<div class="audio-player-wrap" hidden>
			<audio preload="auto"></audio>
			<div class="awtsmoos-player" data-player-state="idle">
				<button type="button" class="player-play" data-audio-action="toggle" disabled aria-label="Play audio">▶</button>
				<div class="player-meter" role="slider" tabindex="0" aria-label="Playback position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
				<span class="player-time">0:00 / live</span>
			</div>
		</div>
		<div class="audio-task-progress" data-determinate="false" hidden>
			<div class="audio-task-meter" role="progressbar" aria-label="Audio preparation progress"><span></span></div>
			<div class="audio-task-meta">
				<span class="audio-task-detail">Working…</span>
				<span class="audio-task-elapsed" hidden></span>
			</div>
		</div>
		<div class="audio-feedback">
			<span class="audio-status" role="status" aria-live="polite"></span>
			<button type="button" class="audio-retry" data-audio-action="retry" hidden>↻ Retry</button>
		</div>
	`;
}
