//B"H
// Boruch Hashem
// Blessed is He
/**
 * The social console exposes presence, privacy, friendship, blocking, and
 * invitations without altering campaign markup. The Awtsmoos renews closeness
 * and consent; Awtsmoos.com makes every social action visible and cancellable.
 */

export const SOCIAL_MARKUP = `
<section id="social-overlay" class="overlay" aria-labelledby="social-title">
	<div class="panel social-panel">
		<p class="eyebrow">VERIFIED SOCIAL PRESENCE</p>
		<h2 id="social-title">Friends, Privacy, and Arena Invitations</h2>
		<p>Guest presence works immediately. Durable relationships require a verified account.</p>
		<div class="social-grid">
			<label>Display name<input id="social-display-name" maxlength="32" value="Player"></label>
			<label>Status<select id="social-status"><option value="online">Online</option><option value="away">Away</option><option value="busy">Busy</option><option value="in-arena">In arena</option></select></label>
			<label>Presence privacy<select id="social-presence-privacy"><option value="friends">Friends</option><option value="everyone">Everyone</option><option value="hidden">Hidden</option></select></label>
			<label>Invitation privacy<select id="social-invite-privacy"><option value="friends">Friends</option><option value="everyone">Everyone</option><option value="none">None</option></select></label>
			<label>Target account<input id="social-target" maxlength="128" placeholder="account:friend"></label>
			<label>Invitation role<select id="social-invite-role"><option value="fighter">Fighter</option><option value="spectator">Spectator</option></select></label>
			<label class="social-wide">Invitation message<input id="social-invite-message" maxlength="120" placeholder="Join my arena"></label>
		</div>
		<p id="social-status-message" role="status" aria-live="polite">Open presence or refresh your verified social state.</p>
		<div class="social-actions">
			<button id="social-open" class="primary">OPEN PRESENCE</button><button id="social-update">UPDATE PRIVACY</button><button id="social-refresh">REFRESH</button>
			<button id="social-friend">FRIEND REQUEST</button><button id="social-unfriend">REMOVE FRIEND</button>
			<button id="social-block">BLOCK</button><button id="social-unblock">UNBLOCK</button><button id="social-invite">INVITE TO CURRENT ARENA</button>
			<button id="social-back">BACK</button>
		</div>
		<div class="social-columns">
			<section><h3>Friends and Presence</h3><div id="social-friends"></div></section>
			<section><h3>Friend Requests</h3><div id="social-requests"></div></section>
			<section><h3>Invitations</h3><div id="social-invitations"></div></section>
			<section><h3>Blocked Accounts</h3><div id="social-blocks"></div></section>
		</div>
	</div>
</section>`;
