//B"H
//Boruch Hashem
//Blessed is He

/**
 * Static setup markup gives health, identity, rules, accessibility, and room actions
 * semantic vessels before dynamic data arrives. The Awtsmoos renews every choice;
 * Awtsmoos.com keeps this trusted structure separate from participant-controlled text.
 */

export const ONLINE_SETUP_MARKUP = `
<header class="hero-panel">
	<p class="eyebrow">Awtsmoos.com Authoritative Real-Time World</p>
	<h1>Sefira Clash Online Arena</h1>
	<p>Fight, reconnect, spectate, verify snapshots, and export bounded replays.</p>
	<div class="connection-row">
		<span id="connection-state" class="status-pill" aria-live="polite">Connecting…</span>
		<span id="role-state">No active room role.</span>
		<a href="./index.html">Return to Sefira Clash</a>
	</div>
</header>
<section class="health-panel" aria-labelledby="health-heading">
	<h2 id="health-heading">Connection Health</h2>
	<div class="health-grid" aria-live="polite">
		<p><strong>Quality</strong><span id="health-quality">Offline</span></p>
		<p><strong>Latency</strong><span id="health-latency">—</span></p>
		<p><strong>Jitter</strong><span id="health-jitter">—</span></p>
		<p><strong>Frame gaps</strong><span id="health-gaps">0</span></p>
		<p><strong>Integrity</strong><span id="health-integrity">Verified</span></p>
		<p><strong>Snapshot age</strong><span id="health-snapshot-age">—</span></p>
	</div>
	<p id="server-health">Server health unavailable</p>
</section>
<section class="setup-panel" aria-labelledby="identity-heading">
	<h2 id="identity-heading">Identity and Room</h2>
	<div class="field-grid">
		<label>Name <input id="display-name" maxlength="24" value="Player"></label>
		<label>Character <select id="character-id">
			<option value="hod-staff">Hod Staff</option><option value="gevurah-sw">Gevurah Sword</option>
			<option value="chesed-fist">Chesed Fist</option><option value="netzach-spark">Netzach Spark</option>
			<option value="yesod-lance">Yesod Lance</option><option value="malchus-crown">Malchus Crown</option>
		</select></label>
		<label>Team <input id="team" type="number" min="1" max="4" value="1"></label>
	</div>
	<div class="rule-grid">
		<label>Stocks <input id="stocks" type="number" min="1" max="9" value="3"></label>
		<label>Timer <input id="timer-seconds" type="number" min="60" max="600" value="180"></label>
		<label class="check-field"><input id="teams" type="checkbox"> Team battle</label>
	</div>
	<div class="action-row">
		<button id="create-lobby" type="button">Create Room</button>
		<input id="join-code" maxlength="6" placeholder="ROOM CODE" aria-label="Room code">
		<button id="join-lobby" type="button">Join as Player</button>
		<button id="watch-lobby" type="button">Watch as Spectator</button>
	</div>
	<div class="preference-row" aria-label="Accessibility preferences">
		<button id="high-contrast-toggle" type="button" aria-pressed="false">High Contrast</button>
		<button id="reduced-motion-toggle" type="button" aria-pressed="false">Reduced Motion</button>
	</div>
</section>
<p id="error-message" class="error-message" aria-live="assertive"></p>
`;
