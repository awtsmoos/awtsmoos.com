// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews the visible controls while Awtsmoos.com keeps preset,
 * preview, JSON, and live scene actions joined to the same editable identity.
 */
export class CharacterCustomizerTemplate {
	static panel() {
		return `<section id="character-customizer" class="character-customizer" data-open="false">
			<button class="character-lab-toggle" data-character-toggle>Character Lab</button>
			<div class="character-lab-card">
				<header>
					<div><b>Original Character Lab</b><small>Reference presets · live rig · dynamic JSON</small></div>
					<button data-character-close aria-label="Close character lab">×</button>
				</header>
				<div class="character-lab-layout">
					<div class="character-controls"><div data-character-fields></div></div>
					<aside>${this.aside()}</aside>
				</div>
			</div>
		</section>`;
	}

	static aside() {
		return `${this.referencePresets()}
			<canvas width="320" height="420"></canvas>
			<textarea data-character-ai placeholder="Describe an original character: appearance, wardrobe, movement, gaze, mouth, and expression..."></textarea>
			<div class="character-actions">
				<button data-character-propose>Design from prompt</button>
				<button data-character-apply>Apply to scene</button>
				<button data-character-save>Save JSON</button>
			</div>
			<p data-character-status>Ready. Reference presets remain fully editable.</p>
			<textarea data-character-json spellcheck="false"></textarea>
			<div class="character-actions">
				<button data-character-json-apply>Apply edited JSON</button>
				<button data-character-export>Export JSON</button>
			</div>
			<select data-character-library>
				<option value="">Saved character library</option>
			</select>`;
	}

	static referencePresets() {
		return `<div class="character-reference-presets">
			<strong>Reference trio</strong>
			<div class="character-actions">
				<button data-character-preset="cheerful_orthodox_speaker">Cheerful speaker</button>
				<button data-character-preset="skeptical_orthodox_observer">Skeptical observer</button>
				<button data-character-preset="calm_orthodox_woman">Calm woman</button>
			</div>
			<button data-character-trio>Load all three dynamically</button>
		</div>`;
	}
}
