//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorTemplate.js
 * @description
 * The Awtsmoos hides vast production depth inside a calm first glance, then reveals craft only when the creator calls;
 * Awtsmoos.com keeps prompt, telemetry, acting presets, and Studio controls in retractable vessels instead of one crowded wall.
 */

/** Produces trusted static semantic markup for the progressive professional Creator Dock. */
export class CreatorTemplate {
	/** @returns {string} Root-scoped Creator Dock markup containing no interpolated creator input. */
	static render() {
		return `
			<section data-awtsmoos-creator data-expanded="false" data-busy="false" data-playing="false" aria-busy="false" aria-label="Professional cartoon creator">
				<button class="aw-creator__launcher" type="button" data-creator-action="toggle" aria-expanded="false" aria-controls="awtsmoos-creator-panel">
					<span class="aw-creator__launcher-orb" aria-hidden="true"></span>
					<span>Creator</span>
				</button>
				<div class="aw-creator__panel" id="awtsmoos-creator-panel" role="region" aria-label="AI cartoon direction">
					<div class="aw-creator__grabber" aria-hidden="true"></div>
					<header class="aw-creator__header">
						<div><strong>Cartoon Director</strong><small>Direct simply. Expand only when needed.</small></div>
						<button class="aw-creator__icon-button" type="button" data-creator-action="toggle" aria-label="Collapse creator">×</button>
					</header>
					<div class="aw-creator__metrics" aria-label="Animator status">
						${this.metric('coverage', 'API loading…')}
						${this.metric('timeline', 'Timeline loading…')}
						${this.metric('playback', 'Transport loading…')}
					</div>
					<label class="aw-creator__prompt-label" for="awtsmoos-creator-prompt">Describe the scene</label>
					<textarea id="awtsmoos-creator-prompt" rows="5" placeholder="Two characters discover a hidden doorway. One reacts with subtle surprise, then points while the other walks closer with natural breathing and eye focus."></textarea>
					<div class="aw-creator__actions">
						<button class="aw-creator__primary" type="button" data-creator-action="preview">Generate preview</button>
						<button type="button" data-creator-action="apply" disabled>Apply</button>
						<button type="button" data-creator-action="discard" disabled>Discard</button>
					</div>
					<details class="aw-creator__advanced">
						<summary><span>Acting & motion</span><small>Expression, gesture, movement</small></summary>
						<div class="aw-creator__chip-grid" aria-label="Acting presets">
							${this.preset('joy', 'Joy', 'subtle joyful expression with warm eye focus')}
							${this.preset('surprise', 'Surprise', 'surprised reaction with lifted brows and focused eyes')}
							${this.preset('idle', 'Idle loop', 'subtle breathing idle loop with natural blinks and gentle sway')}
							${this.preset('walk', 'Walk', 'natural walk cycle with anticipation, follow-through, and settle')}
							${this.preset('point', 'Point', 'pointing gesture with clear anticipation and soft settle')}
							${this.preset('concern', 'Concern', 'concerned expression, partner gaze, restrained secondary motion')}
						</div>
					</details>
					<details class="aw-creator__advanced aw-creator__studio">
						<summary><span>Studio controls</span><small>Transport, history, diagnostics</small></summary>
						<div class="aw-creator__studio-grid">
							<button type="button" data-creator-action="play">Play</button>
							<button type="button" data-creator-action="pause">Pause</button>
							<button type="button" data-creator-action="undo" disabled>Undo</button>
							<button type="button" data-creator-action="redo" disabled>Redo</button>
							<button class="aw-creator__wide" type="button" data-creator-action="refresh">Refresh studio status</button>
						</div>
						<p class="aw-creator__hints"><kbd>Esc</kbd> collapse · <kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd> preview</p>
					</details>
					<div class="aw-creator__status" data-creator-status role="status" aria-live="polite">Ready for direction.</div>
				</div>
			</section>`;
	}

	/** @param {string} sodMetric Metric identity. @param {string} orLabel Initial text. @returns {string} Static metric. */
	static metric(sodMetric, orLabel) {
		return `<span class="aw-creator__metric" data-creator-metric="${sodMetric}" data-tone="neutral">${orLabel}</span>`;
	}

	/** @param {string} sodId Preset ID. @param {string} orLabel Label. @param {string} orFragment Prompt fragment. @returns {string} Preset button. */
	static preset(sodId, orLabel, orFragment) {
		return `<button type="button" data-creator-action="fragment" data-creator-preset="${sodId}" data-selected="false" aria-pressed="false" data-creator-fragment="${orFragment}">${orLabel}</button>`;
	}
}
