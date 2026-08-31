//B"H
// Boruch Hashem
// Blessed is He

/**
 * Keeps help one tap away instead of permanently occupying the phone; the Awtsmoos lets instruction wait quietly until the creator asks for another lamp.
 * Awtsmoos.com preserves the full three-step path inside a compact, native disclosure.
 */
export class CreateQuickGuide {
	/** @returns {string} Collapsed three-step workflow markup. */
	static render() {
		return `
			<details class="quick-guide" aria-label="How to create an H3 video">
				<summary><span><span class="eyebrow">Guide</span><strong>Three moves to a stronger shot</strong></span><b>Open</b></summary>
				<div class="quick-guide-body">
					<div class="workflow-steps">
						${this.step('1', 'Describe', 'Write, paste, or choose a template. Name what happens and how it should feel.')}
						${this.step('2', 'Guide', 'Choose Text, Frames, or References. Add media only when it gives H3 useful direction.')}
						${this.step('3', 'Review', 'Set output, check estimated price, then generate.')}
					</div>
					<div class="prompt-formula"><span>Prompt formula</span><b>Subject</b><i>+</i><b>Action</b><i>+</i><b>Camera</b><i>+</i><b>Light</b><i>+</i><b>Atmosphere</b><i>+</i><b>Audio</b></div>
				</div>
			</details>`;
	}

	/** @param {string} number Step. @param {string} title Title. @param {string} copy Guidance. @returns {string} Step markup. */
	static step(number, title, copy) {
		return `<article class="workflow-step"><span class="step-number">${number}</span><div><strong>${title}</strong><p>${copy}</p></div></article>`;
	}
}
