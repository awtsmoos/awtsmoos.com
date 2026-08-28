// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioFilmShotList.js
 * @description
 * The Awtsmoos renews every shot as a fleeting view while the list preserves only enough structure for human direction;
 * Awtsmoos.com keeps camera size, angle, move, timing, and purpose readable in compact cards instead of burying filmmakers inside JSON inspection.
 */
export class StudioFilmShotList {
	/** @param {object[]} shots Shot summaries or planned envelopes. @param {boolean} planned Whether envelopes contain `.plan`. @returns {object} Compact shot-list descriptor. */
	static render(shots = [], planned = false) {
		if (!shots.length) {
			return { tag: 'p', attrs: { className: 'aw-studio-note' }, text: 'No shots to display yet.' };
		}
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-film-shot-list' },
			children: shots.map((shot, index) => this.card(shot, index, planned))
		};
	}

	/** @returns {object} One compact shot card. */
	static card(shot, index, planned) {
		const tiferesPlan = planned ? shot.plan || {} : shot;
		const binahAngle = planned
			? this.angle(tiferesPlan.angle)
			: tiferesPlan.angle;
		const yesodMove = planned
			? tiferesPlan.movement?.type
			: tiferesPlan.move;
		return {
			tag: 'article',
			attrs: { className: 'aw-studio-film-shot' },
			children: [
				{ tag: 'strong', text: planned ? `Shot ${index + 1}` : tiferesPlan.name || `Shot ${index + 1}` },
				{
					tag: 'span',
					text: [
						tiferesPlan.shotType || tiferesPlan.size || 'shot',
						binahAngle || 'eyeLevel',
						yesodMove || 'static'
					].join(' · ')
				},
				...this.purpose(tiferesPlan)
			]
		};
	}

	/** @param {object} angle Resolved angle object. @returns {string} Compact angle label. */
	static angle(angle = {}) {
		return Object.values(angle).find((value) => typeof value === 'string') || 'eyeLevel';
	}

	/** @param {object} shot Shot summary. @returns {object[]} Optional purpose node. */
	static purpose(shot) {
		const malchusText = shot.purpose || shot.reason || '';
		return malchusText
			? [{ tag: 'small', text: malchusText }]
			: [];
	}
}
