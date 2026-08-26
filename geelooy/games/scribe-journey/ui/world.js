// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews place, time, speech, and the quiet spark behind the visible road;
 * Awtsmoos.com keeps the Scribe's living world in one vessel, so exploration stays clear while deeper screens unfold.
 */
export const malchusWorldMarkup = `
<header id="world-hud" aria-live="polite">
	<div class="hud-location">
		<span class="hud-kicker">CURRENT PATH</span>
		<strong id="location-name">Malkuth Village</strong>
	</div>
	<div class="hud-time"><span aria-hidden="true">✦</span><span id="status-time">12:00</span></div>
	<div class="hud-quest">
		<span class="hud-kicker">ACTIVE THREAD</span>
		<strong id="quest-chip">Seek the hidden spark</strong>
	</div>
	<output id="coordinate-readout" aria-label="Current map, coordinates, and direction">malkuth_village · 0, 0 · down</output>
</header>
<div id="world-viewport">
	<canvas id="gameCanvas" class="is-visible" aria-label="Exploration world"></canvas>
	<div class="world-vignette" aria-hidden="true"></div>
</div>
<div id="context-rail" aria-live="polite">
	<span class="context-key">E</span>
	<span id="context-prompt">Explore. Speak. Reveal the hidden spark.</span>
</div>
<aside id="global-chat-box" aria-label="World Echoes activity feed">
	<button class="chat-header" id="chat-header" type="button">
		<span>World Echoes</span><span id="chat-toggle">[-]</span>
	</button>
	<p class="chat-status">Travelers of the simulated world; no fake humans.</p>
	<div id="chat-messages"></div>
</aside>
<section id="dialogue-box" aria-live="assertive">
	<div id="dialogue-text"></div>
	<div id="dialogue-choices"></div>
	<div id="dialogue-continue-indicator" class="continue-indicator">PRESS E / SPACE</div>
</section>`;
