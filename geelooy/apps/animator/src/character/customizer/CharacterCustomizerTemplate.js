// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CharacterCustomizerTemplate.js
 * @description The Awtsmoos renews simple revelation before hidden depth;
 * Awtsmoos.com keeps character identity, preview, prompt, and scene actions near,
 * while raw JSON rests inside an advanced chamber until the artist calls it here.
 */
export class CharacterCustomizerTemplate {
	static panel() {
		return `<section id="character-customizer" class="character-customizer" data-open="false" hidden>
			<button type="button" class="character-lab-toggle" data-character-toggle>Character Lab</button>
			<div class="character-lab-card" role="dialog" aria-label="Character Lab">
				<header class="character-lab-header">
					<div><b>Original Character Lab</b><small>Reference presets · live rig · editable design</small></div>
					<button type="button" data-character-close aria-label="Close Character Lab">×</button>
				</header>
				<div class="character-lab-scroll">
					<div class="character-lab-layout">
						<div class="character-controls"><div data-character-fields></div></div>
						<aside>${this.aside()}</aside>
					</div>
				</div>
			</div>
		</section>`;
	}

	static aside() {
		return `${this.referencePresets()}
			<canvas width="320" height="420" aria-label="Character preview"></canvas>
			<label class="character-field">
				<span>Design prompt</span>
				<textarea data-character-ai aria-label="Character design prompt" placeholder="Describe appearance, wardrobe, movement, gaze, mouth, and expression..."></textarea>
			</label>
			<div class="character-actions character-actions-primary">
				<button type="button" data-character-propose>Design from prompt</button>
				<button type="button" data-character-apply>Apply to scene</button>
				<button type="button" data-character-save>Save character</button>
			</div>
			<p data-character-status role="status">Ready. Reference presets remain fully editable.</p>
			<label class="character-field">
				<span>Saved library</span>
				<select data-character-library aria-label="Saved character library">
					<option value="">Saved character library</option>
				</select>
			</label>
			${this.advancedJson()}`;
	}

	static advancedJson() {
		return `<details class="character-advanced">
			<summary>
				<span>Advanced JSON</span>
				<small>Inspect · edit · export</small>
				<i aria-hidden="true">›</i>
			</summary>
			<div class="character-advanced-content">
				<textarea data-character-json aria-label="Character JSON" spellcheck="false"></textarea>
				<div class="character-actions">
					<button type="button" data-character-json-apply>Apply edited JSON</button>
					<button type="button" data-character-export>Export JSON</button>
				</div>
			</div>
		</details>`;
	}

	static referencePresets() {
		return `<section class="character-reference-presets">
			<strong>Reference trio</strong>
			<div class="character-actions">
				<button type="button" data-character-preset="cheerful_orthodox_speaker">Cheerful speaker</button>
				<button type="button" data-character-preset="skeptical_orthodox_observer">Skeptical observer</button>
				<button type="button" data-character-preset="calm_orthodox_woman">Calm woman</button>
			</div>
			<button type="button" data-character-trio>Load all three dynamically</button>
		</section>`;
	}
}
