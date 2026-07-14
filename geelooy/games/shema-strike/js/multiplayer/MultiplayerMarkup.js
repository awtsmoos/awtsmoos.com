//B"H
// Boruch Hashem
// Blessed is He
/**
 * Accessible markup opens creation, discovery, witnessing, reconnect, and exit
 * without rewriting the campaign document. The Awtsmoos renews every choice;
 * Awtsmoos.com keeps all online paths explicit, reversible, and optional.
 */

export const ONLINE_OVERLAY_MARKUP = `
<section id="online-overlay" class="overlay" aria-labelledby="online-title">
	<div class="panel online-panel">
		<p class="eyebrow">OPTIONAL ONLINE CIVILIZATION</p>
		<h2 id="online-title">Enter a Server-Authoritative Arena</h2>
		<p>Campaign progress remains local and never requires this connection.</p>
		<div class="online-grid">
			<label>Player name<input id="online-name" maxlength="24" autocomplete="nickname" value="Player"></label>
			<label>Arena code<input id="online-code" maxlength="6" autocapitalize="characters" autocomplete="off"></label>
			<label>Arena name<input id="online-arena-name" maxlength="40" value="Shema Strike Arena"></label>
			<label>Visibility<select id="online-visibility"><option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option></select></label>
			<label>Mode<select id="online-mode"><option value="free-for-all">Free for all</option><option value="duel">Duel</option><option value="training">Training</option></select></label>
			<label>Language<select id="online-language"><option value="en">English</option><option value="he">Hebrew</option></select></label>
			<label>Players<select id="online-maximum-players"><option>2</option><option>3</option><option selected>4</option></select></label>
			<label>Spectators<select id="online-maximum-spectators"><option>0</option><option selected>8</option><option>12</option></select></label>
			<label>Bots<select id="online-bot-count"><option selected>0</option><option>1</option><option>2</option><option>3</option></select></label>
			<label>Bot difficulty<select id="online-bot-difficulty"><option value="gentle">Gentle</option><option selected value="balanced">Balanced</option><option value="fierce">Fierce</option></select></label>
			<label>Reconnect window<select id="online-reconnect-window"><option value="15000">15 seconds</option><option selected value="30000">30 seconds</option><option value="60000">60 seconds</option></select></label>
			<label class="online-check"><input id="online-late-join" type="checkbox" checked>Allow late joining</label>
		</div>
		<fieldset id="online-accessibility"><legend>Accessibility signals</legend>
			<label><input type="checkbox" value="high-contrast">High contrast</label>
			<label><input type="checkbox" value="large-text">Large text</label>
			<label><input type="checkbox" value="reduced-motion">Reduced motion</label>
			<label><input type="checkbox" value="reduced-flashes">Reduced flashes</label>
		</fieldset>
		<p id="online-status" role="status" aria-live="polite">Choose an arena action.</p>
		<p>Current code: <strong id="online-current-code" class="online-code">------</strong> · Role: <strong id="online-role">offline</strong></p>
		<ul id="online-players" aria-label="Arena participants"></ul>
		<div class="online-actions">
			<button id="online-create" class="primary">CREATE ARENA</button><button id="online-join">JOIN CODE</button><button id="online-spectate">SPECTATE CODE</button>
			<button id="online-discover">REFRESH PUBLIC ARENAS</button><button id="online-reconnect" hidden>RECONNECT SESSION</button>
			<button id="online-resume" hidden>RESUME ARENA</button><button id="online-leave" hidden>LEAVE ARENA</button><button id="online-back">BACK TO CAMPAIGN</button>
		</div>
		<div id="online-discovery" class="arena-discovery" aria-label="Public arenas"></div>
	</div>
</section>`;

export const ONLINE_TOOLBAR_MARKUP = `
<div id="online-toolbar" hidden aria-live="polite">
	<span>ONLINE · <strong id="online-toolbar-code">------</strong> · <strong id="online-toolbar-role">offline</strong></span>
	<button id="online-toolbar-menu">ARENA MENU</button>
</div>`;
