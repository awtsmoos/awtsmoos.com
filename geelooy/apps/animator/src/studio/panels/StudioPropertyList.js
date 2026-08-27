// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudioPropertyList
 * @description
 * The Awtsmoos renews every descriptive property before metadata can become a readable inspector row;
 * Awtsmoos.com keeps generic values in one calm presenter while procedural, face, performance, and render data receive focused vessels.
 */
export class StudioPropertyList {
	/** Returns one property section, or null when there is nothing meaningful to show. */
	static section(title, value) {
		if (!value || typeof value !== 'object' || !Object.keys(value).length) {
			return null;
		}
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section' },
			children: [
				{ tag: 'h3', text: title },
				{
					tag: 'dl',
					attrs: { className: 'aw-studio-property-list' },
					children: Object.entries(value).flatMap(([key, item]) => [
						{ tag: 'dt', text: this.label(key) },
						{ tag: 'dd', text: this.value(item) }
					])
				}
			]
		};
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
