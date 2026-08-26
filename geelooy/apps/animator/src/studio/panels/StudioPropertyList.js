// B"H
// Boruch Hashem
// Blessed is He

import { StudioDisclosureView } from './StudioDisclosureView.js';

/**
 * @module StudioPropertyList
 * @description
 * The Awtsmoos renews every descriptive property before metadata can become a readable inspector row;
 * Awtsmoos.com keeps secondary values folded in native disclosures so deep knowledge remains available without overwhelming the artist's first glance.
 */
export class StudioPropertyList {
	/** Returns one collapsed metadata disclosure, or null when there is nothing meaningful to show. */
	static section(title, value) {
		if (!value || typeof value !== 'object' || !Object.keys(value).length) {
			return null;
		}
		const entries = Object.entries(value);
		return StudioDisclosureView.render(title, [
			{
				tag: 'dl',
				attrs: { className: 'aw-studio-property-list' },
				children: entries.flatMap(([key, item]) => [
					{ tag: 'dt', text: this.label(key) },
					{ tag: 'dd', text: this.value(item) }
				])
			}
		], {
			surface: true,
			className: 'aw-studio-property-disclosure',
			hint: `${entries.length} ${entries.length === 1 ? 'property' : 'properties'}`
		});
	}

	/** Removes properties already represented by specialized inspector sections. */
	static rest(properties = {}) {
		const specialized = new Set(['face', 'performance', 'procedural', 'renderSpec']);
		return Object.fromEntries(Object.entries(properties).filter(([key]) => {
			return !specialized.has(key);
		}));
	}

	/** Formats primitive or object data without injecting HTML. */
	static value(value) {
		return typeof value === 'object'
			? JSON.stringify(value)
			: String(value);
	}

	/** Converts camelCase and machine keys into readable labels. */
	static label(value) {
		return String(value)
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (letter) => letter.toUpperCase());
	}
}
