// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives the Chronicle many doors while remaining beyond every door and name;
 * Awtsmoos.com gathers title, ledger, kindness, inventory, and tasks so chosen depth never swallows the game.
 */
export const tiferesMenuMarkup = `
<section id="main-menu" class="menu-screen is-visible" aria-labelledby="game-title">
	<div class="title-sigil" aria-hidden="true">א</div>
	<p class="eyebrow">A MONSTER JOURNEY THROUGH THE SEFIROT</p>
	<h1 class="title-logo" id="game-title">The Scribe's Journey</h1>
	<p class="subtitle-logo">Echoes of Ein Sof</p>
	<div class="title-actions">
		<button class="menu-button primary-button" data-action="newGame">Begin Anew</button>
		<button class="menu-button" data-action="loadGame" id="main-menu-load-game-button">Continue Chronicle</button>
		<button class="menu-button quiet-button" data-action="settings-screen">Settings</button>
	</div>
	<p class="version-copy">Poemmon Edition · Kabbalah Adventure</p>
</section>
<section id="gameMenu" class="menu-screen" aria-label="Chronicle menu">
	<div class="modal-content menu-ledger">
		<h2>Chronicle</h2>
		<div class="menu-grid">
			<button class="menu-button" data-action="resume">Resume</button>
			<button class="menu-button" data-action="inventory-screen">Satchel</button>
			<button class="menu-button" data-action="shem-screen">Shem</button>
			<button class="menu-button" data-action="crafting-screen">Tikkun</button>
			<button class="menu-button" data-action="quest-log-screen">Tasks</button>
			<button class="menu-button" data-action="bestiary-screen">Bestiary</button>
			<button class="menu-button" data-action="mitzvah-screen">Mitzvah Tank</button>
			<button class="menu-button" data-action="gates-screen">50 Gates</button>
			<button class="menu-button" data-action="gates37-screen">37 Wisdom Gates</button>
			<button class="menu-button" data-action="player-quest-screen">Quest Board</button>
			<button class="menu-button" data-action="features-screen">Features</button>
			<button class="menu-button" data-action="saveGame" id="game-menu-save-game-button">Inscribe</button>
			<button class="menu-button" data-action="exportGame">Export Chronicle</button>
			<button class="menu-button" data-action="settings-screen">Settings</button>
		</div>
		<button class="modal-action-button" data-action="main-menu">Return to Title</button>
	</div>
</section>
<section id="gemach-screen" class="menu-screen">
	<div class="modal-content">
		<h3>Gemach of Loving Kindness</h3>
		<div class="balance-row">
			<span>Pockets <strong id="gemach-player-money">0</strong>p</span>
			<span>Account <strong id="gemach-balance">0</strong>p</span>
		</div>
		<div class="button-row">
			<button class="menu-button" data-action="gemachAction" data-type="deposit" data-amount="10">Deposit 10</button>
			<button class="menu-button" data-action="gemachAction" data-type="withdraw" data-amount="10">Withdraw 10</button>
		</div>
		<button class="modal-action-button" data-action="close-gemach">Exit</button>
	</div>
</section>
<section id="inventory-screen" class="menu-screen">
	<div class="modal-content">
		<h3>Satchel</h3>
		<div id="inventory-list" class="scroll-panel"></div>
		<div id="player-money-display"></div>
		<button class="modal-action-button" data-action="close-inventory">Close</button>
	</div>
</section>
<section id="quest-log-screen" class="menu-screen">
	<div class="modal-content">
		<h3>Tasks of the Scribe</h3>
		<div id="quest-log-list" class="scroll-panel"></div>
		<button class="modal-action-button" data-action="close-questlog">Close</button>
	</div>
</section>
<section id="otzar-screen" class="menu-screen"></section>
<div id="toast-container" aria-live="polite"></div>`;
