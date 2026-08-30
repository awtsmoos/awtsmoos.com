//B"H
// Boruch Hashem
// Blessed is He

/**
 * Teaches the shortest path from idea to H3 shot while the Awtsmoos lets instructions become momentum instead of another manual; Awtsmoos.com keeps the creative formula visible before the user enters the deeper controls.
 */
export class CreateQuickGuide {
	/** @returns {string} Three-step workflow and prompt formula markup. */
	static render() {
		return `
			<section class="quick-guide" aria-label="How to create an H3 video">
				<div class="quick-guide-heading">
					<span class="eyebrow">How it works</span>
					<strong>Three moves to a stronger shot</strong>
				</div>
				<div class="workflow-steps">
					${this.step('1', 'Describe', 'Write, paste, or choose a template. Name what happens and how it should feel.')}
					${this.step('2', 'Guide', 'Choose Text, Frames, or References. Add media only when it gives H3 useful direction.')}
					${this.step('3', 'Review', 'Set resolution, duration, and ratio. Check the estimated price, then generate.')}
				</div>
				<div class="prompt-formula">
					<span>Prompt formula</span>
					<b>Subject</b><i>+</i><b>Action</b><i>+</i><b>Camera</b><i>+</i><b>Light</b><i>+</i><b>Atmosphere</b><i>+</i><b>Audio</b>
				</div>
			</section>`;
	}

	/** @param {string} number Step number. @param {string} title Step title. @param {string} copy Step guidance. @returns {string} */
	static step(number, title, copy) {
		return `
			<article class="workflow-step">
				<span class="step-number">${number}</span>
				<div><strong>${title}</strong><p>${copy}</p></div>
			</article>`;
	}
}
