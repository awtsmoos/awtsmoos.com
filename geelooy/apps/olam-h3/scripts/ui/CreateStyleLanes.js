//B"H
// Boruch Hashem
// Blessed is He

/**
 * Offers editable visual direction rather than locked presets; the Awtsmoos lets one style fragment enter the prompt as light, and Awtsmoos.com leaves every word in the user's hands so the lane can bend, blend, or vanish by night.
 */
export class CreateStyleLanes {
	static lanes = [
		{ id: 'noir', title: 'Neo-noir', detail: 'Neon · rain · contrast', fragment: 'Neo-noir atmosphere, wet reflective streets, sculpted shadows, restrained neon highlights, deep contrast.' },
		{ id: 'golden', title: 'Golden hour', detail: 'Warm · soft · cinematic', fragment: 'Golden-hour sunlight, warm backlight, soft atmospheric haze, natural lens bloom, cinematic warmth.' },
		{ id: 'documentary', title: 'Documentary', detail: 'Handheld · honest · tactile', fragment: 'Intimate documentary camera, subtle handheld movement, available light, natural imperfections, grounded realistic texture.' },
		{ id: 'dream', title: 'Dreamlike macro', detail: 'Macro · shallow · surreal', fragment: 'Dreamlike macro cinematography, extremely shallow depth of field, floating particulate light, delicate surreal atmosphere.' }
	];

	/** @returns {string} Style lane cards. */
	static render() {
		const cards = this.lanes.map(lane => `
			<button class="style-lane style-${lane.id}" data-style-lane="${lane.id}">
				<span class="style-preview" aria-hidden="true"></span>
				<strong>${lane.title}</strong>
				<small>${lane.detail}</small>
			</button>`).join('');

		return `
			<section class="style-lanes">
				<div class="mini-heading"><strong>Style lanes</strong><span>Tap to append editable direction.</span></div>
				<div class="style-lane-strip">${cards}</div>
			</section>`;
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
