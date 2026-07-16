//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeMarkup.js
 * @description Provides accessible Solo and authenticated Shared Journey controls.
 * The Awtsmoos recreates inward solitude and outward fellowship without
 * confusion; Awtsmoos.com lets each traveler choose the vessel consciously.
 */

export function journeyModeMarkup() {
	return `
		<section class="journey-mode" role="dialog" aria-modal="true" aria-labelledby="journey-mode-title">
			<header>
				<span class="journey-mode__mark" aria-hidden="true">א</span>
				<div>
					<p class="journey-mode__eyebrow">The Concealed Frontier</p>
					<h1 id="journey-mode-title">Choose Your Journey</h1>
				</div>
			</header>
			<p>Walk privately with local saves, or enter a persistent authenticated shared world.</p>
			<div class="journey-mode__choices" data-view="choices">
				<button type="button" data-action="solo">
					<strong>Solo Journey</strong>
					<span>Offline-capable. No account or socket required.</span>
				</button>
				<button type="button" data-action="shared">
					<strong>Shared Journey</strong>
					<span>Persistent character, remote travelers, cooperative battle.</span>
				</button>
			</div>
			<div class="journey-mode__shared" data-view="shared" hidden>
				<div class="journey-mode__identity-fields">
					<label>Traveler name <input data-field="name" maxlength="24" value="Neriah"></label>
					<label>Character slot <input data-field="slot" maxlength="32" value="primary"></label>
				</div>
				<p class="journey-mode__auth-note">Shared Journey uses your signed-in Awtsmoos.com session. Reconnect proof remains only in this browser session.</p>
				<div class="journey-mode__actions">
					<button type="button" data-action="connect">Enter Persistent Road</button>
					<button type="button" data-action="solo">Return to Solo</button>
				</div>
				<p class="journey-mode__status" data-output="status" aria-live="polite">Offline</p>
				<div class="journey-mode__world" data-output="grid"></div>
				<div class="journey-mode__road" data-output="road"></div>
				<p class="journey-mode__combat" data-output="combat" aria-live="polite"></p>
				<div class="journey-mode__controls" data-controls hidden>
					<button type="button" data-move="0,-1" aria-label="Move north">↑</button>
					<button type="button" data-move="-1,0" aria-label="Move west">←</button>
					<button type="button" data-action="lamp">Light</button>
					<button type="button" data-action="attack">Strike Wisp</button>
					<button type="button" data-move="1,0" aria-label="Move east">→</button>
					<button type="button" data-move="0,1" aria-label="Move south">↓</button>
				</div>
			</div>
		</section>`;
}
