// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos receives every player through a different finite vessel of motion, sight, hand, and pace;
 * Awtsmoos.com keeps comfort explicit here so accessibility belongs to the journey rather than arriving late in space.
 */
export const binahSettingsMarkup = `
<section id="settings-screen" class="menu-screen" aria-labelledby="settings-title">
	<div class="modal-content settings-ledger">
		<div class="settings-heading">
			<div>
				<p class="eyebrow">COMFORT AND CLARITY</p>
				<h2 id="settings-title">Settings</h2>
			</div>
			<button class="modal-action-button compact-button" data-action="close-settings">Close</button>
		</div>
		<p class="settings-intro">These preferences are stored separately from your Chronicle.</p>
		<form id="settings-form">
			<fieldset class="settings-group">
				<legend>Motion and atmosphere</legend>
				<label class="setting-toggle">
					<span><strong>Reduced motion</strong><small>Limits particles, shake, and animated transitions.</small></span>
					<input type="checkbox" data-setting="reducedMotion">
				</label>
				<label class="setting-toggle">
					<span><strong>Screen shake</strong><small>Allows impact movement during intense moments.</small></span>
					<input type="checkbox" data-setting="screenShake">
				</label>
				<label class="setting-toggle">
					<span><strong>Weather effects</strong><small>Shows rain and ambient weather particles.</small></span>
					<input type="checkbox" data-setting="weatherEffects">
				</label>
				<label class="setting-range">
					<span><strong>Particle density</strong><small>Controls decorative sparks and weather.</small></span>
					<input type="range" min="0" max="2" step="0.25" data-setting="particleDensity">
					<output data-setting-output="particleDensity">100%</output>
				</label>
			</fieldset>
			<fieldset class="settings-group">
				<legend>Display and readability</legend>
				<label class="setting-toggle">
					<span><strong>High contrast</strong><small>Strengthens borders, text, and focus indicators.</small></span>
					<input type="checkbox" data-setting="highContrast">
				</label>
				<label class="setting-toggle">
					<span><strong>Show coordinates</strong><small>Displays map, tile position, and facing direction.</small></span>
					<input type="checkbox" data-setting="showCoordinates">
				</label>
				<label class="setting-range">
					<span><strong>Interface scale</strong><small>Scales menus and readable shell text.</small></span>
					<input type="range" min="0.85" max="1.25" step="0.05" data-setting="uiScale">
					<output data-setting-output="uiScale">100%</output>
				</label>
			</fieldset>
			<fieldset class="settings-group">
				<legend>Touch controls</legend>
				<label class="setting-toggle">
					<span><strong>Left-handed layout</strong><small>Swaps joystick and action-button sides.</small></span>
					<input type="checkbox" data-setting="leftHanded">
				</label>
				<label class="setting-toggle">
					<span><strong>Haptics</strong><small>Allows brief vibration on touch controls.</small></span>
					<input type="checkbox" data-setting="haptics">
				</label>
				<label class="setting-range">
					<span><strong>Control scale</strong><small>Changes touch-target size.</small></span>
					<input type="range" min="0.8" max="1.25" step="0.05" data-setting="touchScale">
					<output data-setting-output="touchScale">100%</output>
				</label>
				<label class="setting-range">
					<span><strong>Control opacity</strong><small>Changes touch-control visibility.</small></span>
					<input type="range" min="0.45" max="1" step="0.05" data-setting="touchOpacity">
					<output data-setting-output="touchOpacity">82%</output>
				</label>
				<label class="setting-range">
					<span><strong>Joystick sensitivity</strong><small>Adjusts how far the thumb must move.</small></span>
					<input type="range" min="0.5" max="1.5" step="0.1" data-setting="joystickSensitivity">
					<output data-setting-output="joystickSensitivity">1</output>
				</label>
			</fieldset>
		</form>
		<div class="chronicle-tools" aria-labelledby="chronicle-tools-title">
			<h3 id="chronicle-tools-title">Chronicle recovery</h3>
			<p>Export a validated portable copy or import one you previously created.</p>
			<div class="button-row">
				<button class="menu-button" data-action="exportGame">Export Chronicle</button>
				<label class="menu-button file-button" for="chronicle-import-input">Import Chronicle</label>
				<input id="chronicle-import-input" class="visually-hidden" type="file" accept="application/json,.json">
			</div>
		</div>
		<p id="settings-status" class="settings-status" role="status" aria-live="polite"></p>
		<div class="settings-footer">
			<button class="menu-button quiet-button" data-action="resetSettings">Reset Settings</button>
			<button class="modal-action-button" data-action="close-settings">Done</button>
		</div>
	</div>
</section>`;
