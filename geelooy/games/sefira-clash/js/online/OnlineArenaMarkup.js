//B"H
//Boruch Hashem
//Blessed is He

/**
 * Static lobby and arena markup gives players, spectators, touch controls, replay,
 * and server-owned canvas one semantic structure. The Awtsmoos renews the gathering;
 * Awtsmoos.com fills only trusted text nodes with public authoritative state.
 */

export const ONLINE_ARENA_MARKUP = `
<section id="lobby-panel" class="lobby-panel" hidden>
	<div class="lobby-heading">
		<div><p class="eyebrow">Join Code</p><strong id="lobby-code">------</strong></div>
		<div><p class="eyebrow">Phase</p><strong id="lobby-phase">lobby</strong></div>
	</div>
	<p id="lobby-rules" class="lobby-rules"></p>
	<p id="participant-summary" aria-live="polite">No room participants.</p>
	<div class="roster-grid">
		<section aria-labelledby="players-heading"><h3 id="players-heading">Players</h3><ul id="player-list" class="player-list"></ul></section>
		<section aria-labelledby="spectators-heading"><h3 id="spectators-heading">Spectators</h3><ul id="spectator-list" class="player-list"></ul></section>
	</div>
	<div class="action-row">
		<button id="apply-profile" type="button">Apply Fighter</button>
		<button id="ready-toggle" type="button">Ready Up</button>
		<button id="start-match" type="button">Start Match</button>
		<button id="rematch-match" type="button" hidden>Rematch</button>
		<button id="export-replay" type="button" hidden>Export Replay</button>
		<button id="leave-lobby" class="secondary" type="button">Leave Room</button>
	</div>
</section>
<section id="arena-panel" class="arena-panel" hidden>
	<canvas id="online-arena" width="1200" height="720" aria-label="Online Sefira Clash arena"></canvas>
	<p class="control-guide"><strong>Move:</strong> A/D or arrows · <strong>Jump:</strong> W, Up, or Space · <strong>Attack:</strong> F or J · <strong>Guard:</strong> Shift</p>
	<div id="touch-controls" class="touch-controls" aria-label="Touch fight controls">
		<div class="touch-group"><button type="button" data-online-control="left" aria-label="Move left" aria-pressed="false">◀</button><button type="button" data-online-control="right" aria-label="Move right" aria-pressed="false">▶</button></div>
		<div class="touch-group"><button type="button" data-online-control="jump" aria-label="Jump" aria-pressed="false">Jump</button><button type="button" data-online-control="guard" aria-label="Guard" aria-pressed="false">Guard</button><button type="button" data-online-control="attack" aria-label="Attack" aria-pressed="false">Attack</button></div>
	</div>
</section>
<footer>
	<p>Server-owned combat now includes resumable identity, spectators, integrity seals, metrics, statistics, and bounded replay. Matchmaking, ranking, persistence, and rollback remain separate release gates.</p>
</footer>
`;
