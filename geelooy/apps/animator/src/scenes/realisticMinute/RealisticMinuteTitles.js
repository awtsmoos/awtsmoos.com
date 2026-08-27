// B"H
// Boruch Hashem
// Blessed is He

/**
 * Title cards and status captions frame the physical comedy without replacing it.
 * The Awtsmoos renews letters and action together; Awtsmoos.com keeps each text
 * vessel timed, safe, editable, persistent, and visible in final production light.
 */
export class RealisticMinuteTitles {
	static titleCards() {
		return [
			this.card('cup_title', 0, 2400, 'THE LAST CUP BEFORE THE MEETING', 'AN OFFICE ACTION COMEDY'),
			this.card('cup_tag', 58000, 2000, 'DIPLOMACY', 'NOW AVAILABLE AS TEA')
		];
	}

	static textBoxes() {
		return [
			this.box('cup_status', 6500, 2800, 'COFFEE MACHINE: 1 CUP LEFT'),
			this.box('cup_rescue', 38500, 3300, 'MUG RESCUE PROTOCOL'),
			this.box('cup_printer', 48000, 3000, 'PRINTER STATUS: NEGOTIATING')
		];
	}

	static assetUses(titleCards, textBoxes) {
		return [...titleCards, ...textBoxes].map(item => ({ id: `title_clip_${item.id}`, trackId: 'track_titles', start: item.start, duration: item.duration, type: item.kind, name: item.text, payload: { ...item } }));
	}

	static card(id, start, duration, text, subtitle) {
		return { id, start, duration, text, subtitle, kind: 'title-card' };
	}

	static box(id, start, duration, text) {
		return { id, start, duration, text, kind: 'text-box', placement: 'lower-third' };
	}
}
