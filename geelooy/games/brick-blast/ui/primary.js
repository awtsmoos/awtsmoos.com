// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews menu, choice, and doorway before the first brick can fall;
 * Awtsmoos.com keeps the primary screens in one small vessel so the player can read the journey, not a wall.
 */
export const chesedPrimaryMarkup = `
<div class="persistent-holy-text left">B"H</div>
<div class="persistent-holy-text right">ב"ה</div>
<div id="main-menu" class="screen active">
	<div id="main-menu-perutas" class="peruta-display">0 ¤</div>
	<div class="title-container">
		<div class="logo">
			<div class="logo-brick c1"></div><div class="logo-brick c2"></div>
			<div class="logo-brick c3"></div><div class="logo-brick c4"></div>
		</div>
		<h1>Brick Blast</h1>
	</div>
	<div id="high-score-display" class="high-score">High Score: 0</div>
	<div class="main-menu-buttons">
		<button id="play-button" class="btn btn-primary">Campaign</button>
		<button id="infinite-mode-button" class="btn btn-secondary">Infinite Mode</button>
		<button id="custom-levels-button" class="btn btn-secondary">Custom Levels</button>
		<button id="shop-button" class="btn btn-tertiary">Shop</button>
	</div>
	<footer class="footer-text">Built with Native JS</footer>
</div>
<div id="level-select" class="screen">
	<div class="header"><button id="level-select-back-button" class="btn-back">&lt;</button><h2>Select Level</h2></div>
	<div id="level-grid" class="level-grid"></div>
</div>
<div id="custom-levels-screen" class="screen">
	<div class="header"><button id="custom-levels-back-button" class="btn-back">&lt;</button><h2>Custom Levels</h2></div>
	<div id="custom-level-list" class="custom-level-list"></div>
	<div class="custom-levels-actions">
		<button id="new-level-button" class="btn btn-primary">Create New</button>
		<label for="import-level-input" class="btn btn-secondary">Import</label>
		<input type="file" id="import-level-input" hidden accept=".json,application/json,text/plain">
	</div>
</div>
<div id="store-screen" class="screen">
	<div id="store-header" class="header">
		<button id="store-back-button" class="btn-back">&lt;</button>
		<h2>Shop</h2>
		<div id="store-perutas" class="peruta-display">0 ¤</div>
	</div>
	<div id="store-grid" class="store-grid"></div>
</div>`;
