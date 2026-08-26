//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorTemplate.js
 * @description
 * The Awtsmoos hides infinite depth inside a simple first glance, then reveals each vessel only when called;
 * Awtsmoos.com keeps the creator surface quiet and clear while advanced acting, motion, and shortcuts remain one disclosure away, not sprawled.
 */

/** Produces trusted static semantic markup for the progressive professional Creator Dock. */
export class CreatorTemplate {
	/**
	 * Returns only authored static HTML; creator-entered text is never interpolated into this template.
	 * @returns {string} Root-scoped Creator Dock markup.
	 */
	static render() {
		return `
			<section data-awtsmoos-creator data-expanded="false" data-busy="false" aria-busy="false" aria-label="Professional cartoon creator">
				<button class="aw-creator__launcher" type="button" data-creator-action="toggle" aria-expanded="false" aria-controls="awtsmoos-creator-panel">
					<span aria-hidden="true">✦</span><span>Creator</span>
				</button>
				<div class="aw-creator__panel" id="awtsmoos-creator-panel" role="region" aria-label="AI cartoon direction">
					<header class="aw-creator__header">
						<div><strong>Cartoon Director</strong><small>Prompt → preview → refine</small></div>
						<button type="button" data-creator-action="toggle" aria-label="Collapse creator">×</button>
					</header>
					<label class="aw-creator__prompt-label" for="awtsmoos-creator-prompt">Describe the scene</label>
					<textarea id="awtsmoos-creator-prompt" rows="5" placeholder="Two characters discover a hidden doorway. One reacts with subtle surprise, then points while the other walks closer with a natural breathing loop."></textarea>
					<div class="aw-creator__actions">
						<button class="aw-creator__primary" type="button" data-creator-action="preview">Generate preview</button>
						<button type="button" data-creator-action="apply" disabled>Apply</button>
						<button type="button" data-creator-action="discard" disabled>Discard</button>
					</div>
					<details class="aw-creator__advanced">
						<summary>Acting & motion direction</summary>
						<div class="aw-creator__chip-grid" aria-label="Acting presets">
							${this.preset('joy', 'Joy', 'subtle joyful expression with warm eye focus')}
							${this.preset('surprise', 'Surprise', 'surprised reaction with lifted brows and focused eyes')}
							${this.preset('idle', 'Idle loop', 'subtle breathing idle loop with natural blinks and gentle sway')}
							${this.preset('walk', 'Walk', 'natural walk cycle with anticipation, follow-through, and settle')}
							${this.preset('point', 'Point', 'pointing gesture with clear anticipation and soft settle')}
							${this.preset('concern', 'Concern', 'concerned expression, partner gaze, restrained secondary motion')}
						</div>
						<p class="aw-creator__hints"><kbd>Esc</kbd> collapse · <kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd> preview</p>
					</details>
					<div class="aw-creator__status" data-creator-status role="status" aria-live="polite">Ready for direction.</div>
				</div>
			</section>`;
	}

	/**
	 * Builds one trusted preset button from authored constants only.
	 * @param {string} sodId Stable preset identifier.
	 * @param {string} orLabel Visible short label.
	 * @param {string} orFragment Trusted prompt fragment appended on selection.
	 * @returns {string} Static preset button markup.
	 */
	static preset(sodId, orLabel, orFragment) {
		return `<button type="button" data-creator-action="fragment" data-creator-preset="${sodId}" data-selected="false" aria-pressed="false" data-creator-fragment="${orFragment}">${orLabel}</button>`;
	}
}
