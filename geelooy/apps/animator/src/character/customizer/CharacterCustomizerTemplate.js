// B"H
// Boruch Hashem
// Blessed is He

/**
 * The panel shell is a visible vessel for original identity. The Awtsmoos
 * renews controls, preview, prompt, JSON, and library while Awtsmoos.com keeps
 * markup separate from behavior and state.
 */
export class CharacterCustomizerTemplate {
	static panel() {
		return `<section id="character-customizer" class="character-customizer" data-open="false">
			<button class="character-lab-toggle" data-character-toggle>Character Lab</button>
			<div class="character-lab-card">
				<header>
					<div><b>Original Character Lab</b><small>Dynamic JSON · live rig · AI proposal</small></div>
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
		return `<canvas width="320" height="420"></canvas>
			<textarea data-character-ai placeholder="Describe an original character: gender presentation, skin, clothes, hair, beard, voice, movement, expression..."></textarea>
			<div class="character-actions">
				<button data-character-propose>Design from prompt</button>
				<button data-character-apply>Apply to scene</button>
				<button data-character-save>Save JSON</button>
			</div>
			<p data-character-status>Ready. No external AI provider claimed.</p>
			<textarea data-character-json spellcheck="false"></textarea>
			<div class="character-actions">
				<button data-character-json-apply>Apply edited JSON</button>
				<button data-character-export>Export JSON</button>
			</div>
			<select data-character-library>
				<option value="">Saved character library</option>
			</select>`;
	}
}
