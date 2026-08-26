// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns each ending into another doorway, whether victory glows or a round falls away;
 * Awtsmoos.com keeps result and retreat states readable while preserving every old display contract for the next play.
 */
export const tiferesResultMarkup = `
<div id="level-complete-screen" class="screen">
	<div class="sparkle-container"></div>
	<div class="result-screen-content">
		<h2 class="level-complete-title">Level Complete!</h2>
		<div id="star-rating" class="star-rating">
			<span class="star">✡</span><span class="star">✡</span><span class="star">✡</span>
			<span class="star">✡</span><span class="star">✡</span><span class="star">✡</span>
		</div>
		<p id="turn-report" class="turn-report">Your Turns: 0 / Par: 0</p>
		<p id="time-report" class="turn-report" style="margin-top: -0.5rem; font-size: 1.1rem; color: var(--primary-accent);">Time: 00:00</p>
		<p id="peruta-bonus" class="peruta-bonus">Bonus: +<span id="level-complete-bonus">0</span> ¤</p>
		<div class="result-buttons">
			<button id="next-level-button" class="btn btn-primary">Next Level</button>
			<button id="level-complete-menu-button" class="btn btn-secondary">Main Menu</button>
		</div>
	</div>
</div>
<div id="game-over-screen" class="screen">
	<div class="result-screen-content">
		<h2>Game Over</h2>
		<p>Your Score: <span id="final-score" class="result-score">0</span></p>
		<p class="peruta-penalty">Penalty: <span id="peruta-penalty-amount">0</span> ¤</p>
		<div class="result-buttons">
			<button id="restart-button" class="btn btn-primary">Play Again</button>
			<button id="game-over-menu-button" class="btn btn-secondary">Main Menu</button>
		</div>
	</div>
</div>`;

export const netzachForfeitMarkup = `
<div id="forfeit-modal" class="modal-backdrop" style="display: none;">
	<div class="modal-content forfeit-content">
		<h3 style="color: var(--warning);">Abandon Mission?</h3>
		<p>Retreating now will incur a celestial penalty of:</p>
		<div id="forfeit-penalty-display" class="forfeit-penalty-display">0 ¤</div>
		<div class="modal-actions">
			<button id="forfeit-cancel-button" class="btn btn-secondary">Stay and Fight</button>
			<button id="forfeit-confirm-button" class="btn btn-danger">Accept Penalty</button>
		</div>
	</div>
</div>`;
