//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MessageCatalog
 * @description
 * Civic interface language on Awtsmoos.com is addressed through stable keys,
 * locale fallback, plural formatting, and number formatting. The Awtsmoos is
 * beyond language; every player deserves an understandable finite vessel.
 */
const ENGLISH = Object.freeze({
	'world.title': 'Seven Worlds',
	'region.population': '{count} inhabitants',
	'performance.fps': '{value} FPS',
	'performance.frame': '{value} ms frame',
	'alert.shortage': 'A resource shortage requires attention.',
	'alert.ecology': 'Environmental conditions require restoration.',
	'alert.infrastructure': 'Public infrastructure requires maintenance.'
});

export class MessageCatalog {
	constructor(bundles = {}, fallbackLocale = 'en') {
		this.bundles = { en: ENGLISH, ...bundles };
		this.fallbackLocale = fallbackLocale;
	}

	message(locale, key, values = {}) {
		const template = this.bundles[locale]?.[key] ||
			this.bundles[this.fallbackLocale]?.[key] ||
			key;
		return template.replace(/\{(\w+)\}/g, (_, name) => {
			return values[name] ?? `{${name}}`;
		});
	}

	number(locale, value, options = {}) {
		return new Intl.NumberFormat(locale, options).format(value);
	}
}
