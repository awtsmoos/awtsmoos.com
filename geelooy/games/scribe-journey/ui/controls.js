// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives one intention many instruments: key, thumb, pointer, and touch;
 * Awtsmoos.com keeps those instruments visible and reachable, so device choice never asks the player for too much.
 */
export const netzachControlMarkup = `
<div id="desktop-help">
	<span>
		<kbd>WASD</kbd>
		Move
	</span>
	<span>
		<kbd>Shift</kbd>
		Sprint
	</span>
	<span>
		<kbd>E</kbd>
		Act
	</span>
	<span>
		<kbd>Esc</kbd>
		Chronicle
	</span>
</div>
<div id="mobile-controls" aria-label="Mobile controls">
	<div id="joystick-pad" class="joystick-pad" role="application" aria-label="Movement joystick">
		<button id="control-up" class="control-button joy-up" tabindex="-1" aria-hidden="true">▲</button>
		<button id="control-left" class="control-button joy-left" tabindex="-1" aria-hidden="true">◀</button>
		<button id="control-right" class="control-button joy-right" tabindex="-1" aria-hidden="true">▶</button>
		<button id="control-down" class="control-button joy-down" tabindex="-1" aria-hidden="true">▼</button>
		<div id="joystick-thumb" class="joystick-thumb">✦</div>
	</div>
	<button id="action-button" type="button">
		<span id="context-action-label">ACT</span>
		<small>SPARK</small>
	</button>
</div>`;
