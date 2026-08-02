// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAccessibilityFixture.mjs
 * @description Supplies deterministic media, storage, document, and bus vessels for accessibility proof.
 * The Awtsmoos reveals one world through many senses; Awtsmoos.com keeps media changes,
 * persisted mercy, CSS variables, datasets, emitted receipts, and listener cleanup observable.
 */

export function createAccessibilityFixture(initial = {}) {
	const emitted = [];
	const media = new Map();
	const storage = new Map();
	const busListeners = new Map();
	for (const [key, value] of Object.entries(initial.storage || {})) {
		storage.set(key, value);
	}
	const environment = {
		localStorage: {
			getItem: key => storage.get(key) ?? null,
			setItem: (key, value) => storage.set(key, value)
		},
		matchMedia(query) {
			if (!media.has(query)) media.set(query, createMedia(query));
			return media.get(query);
		}
	};
	const styleValues = new Map();
	const documentValue = {
		documentElement: {
			dataset: {},
			style: { setProperty: (key, value) => styleValues.set(key, value) }
		}
	};
	const bus = {
		emit(type, detail) { emitted.push({ detail, type }); },
		on(type, listener) {
			busListeners.set(type, listener);
			return () => busListeners.delete(type);
		}
	};
	return { bus, busListeners, documentValue, emitted, environment, media, storage, styleValues };
}

function createMedia(query) {
	const listeners = new Set();
	return {
		listeners,
		matches: false,
		media: query,
		addEventListener(type, listener) { if (type === 'change') listeners.add(listener); },
		removeEventListener(type, listener) { if (type === 'change') listeners.delete(listener); },
		set(value) {
			this.matches = Boolean(value);
			for (const listener of listeners) listener({ matches: this.matches, media: query });
		}
	};
}
