//B"H
// Boruch Hashem
// Blessed is He

/**
 * Keeps visual direction nearby without making optional style compete with the essential path; the Awtsmoos lets color sleep inside glass until called.
 * Awtsmoos.com reveals each look only when its disclosure opens, so inspiration remains Chesed while the quiet default remains Gevurah's measured wall.
 */
export class CreateStyleLanes {
	static lanes = [
		{ id: 'noir', title: 'Neo-noir', detail: 'Neon · rain · contrast', fragment: 'Neo-noir atmosphere, wet reflective streets, sculpted shadows, restrained neon highlights, deep contrast.' },
		{ id: 'golden', title: 'Golden hour', detail: 'Warm · soft · cinematic', fragment: 'Golden-hour sunlight, warm backlight, soft atmospheric haze, natural lens bloom, cinematic warmth.' },
		{ id: 'documentary', title: 'Documentary', detail: 'Handheld · honest · tactile', fragment: 'Intimate documentary camera, subtle handheld movement, available light, natural imperfections, grounded realistic texture.' },
		{ id: 'dream', title: 'Dreamlike macro', detail: 'Macro · shallow · surreal', fragment: 'Dreamlike macro cinematography, extremely shallow depth of field, floating particulate light, delicate surreal atmosphere.' }
	];

	/** @returns {string} Collapsed optional visual-look chooser. */
	static render() {
		const cards = this.lanes.map(lane => `
			<button class="style-lane style-${lane.id}" data-style-lane="${lane.id}">
				<span class="style-preview" aria-hidden="true"></span>
				<strong>${lane.title}</strong>
				<small>${lane.detail}</small>
			</button>`).join('');

		return `
			<details class="style-lanes intuitive-style-lanes">
				<summary class="style-lanes-summary">
					<span><span class="eyebrow">Looks</span><strong>Optional visual direction</strong></span>
					<span class="style-glints" aria-hidden="true"><i></i><i></i><i></i></span>
					<span class="disclosure-mark" aria-hidden="true">+</span>
				</summary>
				<div class="style-lane-body">
					<p>Tap a look to append editable direction to your prompt.</p>
					<div class="style-lane-strip">${cards}</div>
				</div>
			</details>`;
	}

	/** @param {string} prompt Current prompt. @param {string} id Lane ID. @param {number} limit Prompt limit. @returns {string} Prompt with lane appended once. */
	static apply(prompt, id, limit) {
		const lane = this.lanes.find(candidate => candidate.id === id);
		if (!lane) {
			return prompt;
		}
		const prefix = String(prompt).trim();
		if (prefix.includes(lane.fragment)) {
			return prefix;
		}
		const joined = prefix ? `${prefix} ${lane.fragment}` : lane.fragment;
		return joined.slice(0, limit);
	}
}
