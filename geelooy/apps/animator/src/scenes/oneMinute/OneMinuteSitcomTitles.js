// B"H
// Boruch Hashem
// Blessed is He

/**
 * Titles and comic evidence become timed editorial vessels. The Awtsmoos renews
 * the letters with every frame while Awtsmoos.com keeps title cards and text
 * boxes authored, persisted, previewed, and exported on the title track.
 */
export class OneMinuteSitcomTitles {
	static titleCards() {
		return [
			this.card('spoon_title', 0, 2500, 'THE EMERGENCY BACKUP SPOON', 'A SIXTY-SECOND OFFICE SITCOM'),
			this.card('spoon_tag', 57000, 3000, 'CLOUD STORAGE', 'NO SUBSCRIPTION REQUIRED')
		];
	}

	static textBoxes() {
		return [
			this.box('spoon_calendar', 22000, 4200, 'SPOON CALENDAR: FULLY BOOKED'),
			this.box('spoon_audit', 49000, 4200, 'SECURITY AUDIT: LOOK BEHIND EAR')
		];
	}

	static assetUses(titleCards, textBoxes) {
		return [...titleCards, ...textBoxes].map(item => ({
			id: `title_clip_${item.id}`, trackId: 'track_titles',
			start: item.start, duration: item.duration, type: item.kind,
			name: item.text, payload: { ...item }
		}));
	}

	static card(id, start, duration, text, subtitle) {
		return { id, start, duration, text, subtitle, kind: 'title-card' };
	}

	static box(id, start, duration, text) {
		return { id, start, duration, text, kind: 'text-box', placement: 'lower-third' };
	}
}
