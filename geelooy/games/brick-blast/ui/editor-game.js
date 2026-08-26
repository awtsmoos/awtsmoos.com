// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets creation become editable and then playable in the very next breath;
 * Awtsmoos.com keeps editor and arena together here, where one vessel designs and the next tests depth.
 */
export const gevurahEditorGameMarkup = `
<div id="level-editor-screen" class="screen">
	<div class="header">
		<button id="editor-back-button" class="btn-back">&lt;</button>
		<input type="text" id="level-name-input" placeholder="Enter Level Name">
	</div>
	<div class="editor-grid-container"><div id="editor-grid"></div></div>
	<div class="editor-tools">
		<button id="add-row-above-button" class="tool-button">Add Row Above</button>
		<div id="brush-health-display" class="tool-button">Health: 10</div>
		<button id="eraser-button" class="tool-button">Erase</button>
	</div>
	<div class="editor-actions">
		<div class="ai-controls">
			<div class="select-wrapper">
				<select id="ai-provider-select">
					<option value="gemini">Gemini</option>
					<option value="openai">OpenAI</option>
					<option value="claude">Claude</option>
				</select>
			</div>
			<button id="ai-generate-button" class="btn btn-tertiary">AI Generate</button>
		</div>
		<button id="save-level-button" class="btn btn-primary">Save Level</button>
	</div>
</div>
<div id="game-screen" class="screen">
	<header id="game-header">
		<button id="game-back-button" class="btn-back">🏠</button>
		<div class="stats">
			<div class="main-stats">
				<div class="stat">Turns: <span id="turn-tracker">1 / ?</span></div>
				<div class="stat">Balls: <span id="ball-count">0</span></div>
				<div class="stat">⏱️ <span id="game-timer">00:00</span></div>
			</div>
			<div class="sub-stats-container">
				<div class="sub-stat">📏 <span id="paddle-width-stat">80</span></div>
				<div class="sub-stat">🔄 <span id="rebound-charges-stat">0</span></div>
			</div>
		</div>
		<div class="game-header-right">
			<div id="peruta-doubler-icon">💰</div>
			<div class="peruta-display">0 ¤</div>
			<button id="inventory-button">🎒</button>
		</div>
	</header>
	<div id="canvas-wrapper"><canvas id="game-canvas"></canvas></div>
</div>
<div id="inventory-panel">
	<button id="inventory-close-button" class="btn btn-secondary">Close</button>
</div>`;
