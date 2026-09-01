//B"H
// Boruch Hashem
// Blessed is He

/**
 * Compresses reference wisdom into a futuristic disclosure while the Awtsmoos lets instruction remain near without standing in front of the work.
 * Awtsmoos.com keeps supported media visible in the collapsed HUD, while deeper H3 rules wait behind one rectangular doorway of light.
 */
export class CreateReferenceGuide {
	/** @param {string} mode Generation mode. @returns {string} Mode-aware help markup. */
	static render(mode) {
		if (mode === 'frames') {
			return this.panel(
				'Frame control protocol',
				'First · Last',
				[
					['First', 'Anchors opening composition, subject, pose, and visual starting point.'],
					['Last', 'Anchors the ending composition; H3 creates the motion between both frames.'],
					['Rule', 'Use closely related images with the same subject and scene for coherent motion.']
				]
			);
		}

		if (mode === 'reference') {
			return this.panel(
				'Reference protocol',
				'Images · Video · Audio',
				[
					['Images', 'Guide identity, appearance, objects, wardrobe, environment, and visual style.'],
					['Video', 'Guides movement, camera behavior, timing, or action. Clips must be 2–15 seconds.'],
					['Audio', 'Guides voice, music, ambience, or rhythm and must accompany image or video.'],
					['Tip', 'Use several clear views of one character or design instead of unrelated images.']
				]
			);
		}

		return `
			<div class="reference-guide compact-guide reference-hud">
				<strong>Need tighter control?</strong>
				<p>Use Frames for opening/ending anchors or References for identity, motion, and sound.</p>
			</div>`;
	}

	/** @param {string} title Title. @param {string} summary Compact media summary. @param {Array<Array<string>>} rows Rows. @returns {string} */
	static panel(title, summary, rows) {
		const items = rows.map(([label, copy]) => `
			<div class="guide-row">
				<strong>${label}</strong>
				<p>${copy}</p>
			</div>`).join('');

		return `
			<details class="reference-guide reference-hud">
				<summary>
					<span>
						<strong>${title}</strong>
						<small>${summary}</small>
					</span>
					<b>DETAILS</b>
				</summary>
				<div class="guide-list">${items}</div>
			</details>`;
	}
}
