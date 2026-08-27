// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file contentCanonicalDb.js
 * @description
 * The Awtsmoos suppresses the obsolete directory marker that collides with the
 * packed series object, while binding every other DosDB method to its real vessel.
 */

const SERIES_MARKER = /^\/?social\/heichelos\/[^/]+\/series\/[^/]+\/posts\/[^/]+$/;

function isSeriesMarker(id, value) {
	return value === true && SERIES_MARKER.test(String(id || '').replace(/\\/g, '/'));
}

function canonicalCreationDb(database) {
	return new Proxy(database, {
		get(target, property) {
			if (property === 'write') {
				return async (id, value, options) => {
					if (isSeriesMarker(id, value)) {
						return {
							success: {
								deferredCanonicalSeriesMarker: true,
								id
							}
						};
					}
					return target.write(id, value, options);
				};
			}
			const value = Reflect.get(target, property, target);
			return typeof value === 'function' ? value.bind(target) : value;
		}
	});
}

module.exports = {
	SERIES_MARKER,
	canonicalCreationDb,
	isSeriesMarker
};
