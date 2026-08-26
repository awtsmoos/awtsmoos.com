// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos can reveal opposition without dividing the One that gives both sides their breath;
 * Awtsmoos.com keeps combat readable here, where status, choice, and consequence meet without swallowing the journey beneath.
 */
export const gevurahBattleMarkup = `
<section id="battle-screen" class="menu-screen" aria-label="Battle">
	<div class="battle-area">
		<article id="opponent-display" class="battle-musag-display">
			<div class="musag-stats">
				<h4 id="opponent-name"></h4>
				<span id="opponent-level"></span>
			</div>
			<div class="health-bar">
				<div id="opponent-hp-bar" class="health-bar-inner"></div>
			</div>
			<div id="opponent-emoji" class="musag-emoji"></div>
		</article>
		<article id="player-display" class="battle-musag-display">
			<div class="musag-stats">
				<h4 id="player-name"></h4>
				<span id="player-level"></span>
			</div>
			<div class="health-bar">
				<div id="player-hp-bar" class="health-bar-inner"></div>
			</div>
			<div class="kavanah-bar">
				<div id="player-kavanah-bar" class="kavanah-bar-inner"></div>
			</div>
			<div id="player-emoji" class="musag-emoji"></div>
		</article>
	</div>
	<div class="battle-ui-box modal-content">
		<div id="battle-log"></div>
		<div id="battle-menu-container"></div>
		<div id="battle-log-continue-indicator" class="continue-indicator">▼</div>
	</div>
</section>`;
