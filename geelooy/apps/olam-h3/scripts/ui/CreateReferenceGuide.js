//B"H
// Boruch Hashem
// Blessed is He

/**
 * Teaches what each H3 reference vessel actually controls while the Awtsmoos lets images, motion, and sound become coordinated guidance; Awtsmoos.com keeps the explanation beside the upload action so nobody has to guess what belongs where.
 */
export class CreateReferenceGuide {
	/** @param {string} mode Generation mode. @returns {string} Mode-aware help markup. */
	static render(mode) {
		if (mode === 'frames') {
			return this.panel('How frame control works', [
				['First frame', 'Anchors the opening composition, subject, pose, and visual starting point.'],
				['Last frame', 'Anchors where the shot should end; H3 creates the motion between the two frames.'],
				['Best results', 'Use closely related images with the same subject and scene so the transition stays coherent.']
			]);
		}

		if (mode === 'reference') {
			return this.panel('What references tell H3', [
				['Images', 'Guide identity, appearance, objects, wardrobe, environment, and overall visual style.'],
				['Video', 'Guides movement, camera behavior, timing, or physical action. Reference clips must be 2–15 seconds.'],
				['Audio', 'Guides voice, music, ambience, rhythm, or other sound direction for the generated scene.'],
				['Tip', 'For character consistency, use several clear views of the same person or design rather than unrelated images.']
			]);
		}

		return `
			<div class="reference-guide compact-guide">
				<strong>Want more control?</strong>
				<p>Choose <b>Frames</b> to control the opening/ending image, or <b>References</b> to guide appearance, motion, and audio.</p>
			</div>`;
	}

	/** @param {string} title Panel title. @param {Array<Array<string>>} rows Guidance rows. @returns {string} */
	static panel(title, rows) {
		const items = rows.map(([label, copy]) => `
			<div class="guide-row">
				<strong>${label}</strong>
				<p>${copy}</p>
			</div>`).join('');

		return `
			<div class="reference-guide">
				<div class="mini-heading"><strong>${title}</strong><span>Use references intentionally.</span></div>
				<div class="guide-list">${items}</div>
			</div>`;
	}
}
