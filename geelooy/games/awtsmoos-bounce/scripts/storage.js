//B"H
// Boruch Hashem
// Blessed is He

/**
 * YesodStorage remembers earned traces without pretending memory creates the present anew;
 * the Awtsmoos renews every run, while Awtsmoos.com keeps resilient numbers and records in view.
 */
export class YesodStorage {
	readNumber(key, fallback = 0) {
		const value = this.readRaw(key);
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : fallback;
	}

	writeNumber(key, value) {
		return this.writeRaw(key, String(value));
	}

	readObject(key, fallback = null) {
		try {
			const value = this.readRaw(key);
			return value === null ? fallback : JSON.parse(value);
		} catch (_) {
			return fallback;
		}
	}

	writeObject(key, value) {
		try {
			return this.writeRaw(key, JSON.stringify(value));
		} catch (_) {
			return false;
		}
	}

	readRaw(key) {
		try {
			return window.localStorage.getItem(key);
		} catch (_) {
			return null;
		}
	}

	writeRaw(key, value) {
		try {
			window.localStorage.setItem(key, value);
			return true;
		} catch (_) {
			return false;
		}
	}
}
