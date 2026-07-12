// B"H

/**
 * @file core/pager/firmament.js
 * @chapter Two Roads Share One Public Gate
 * @description
 * Preserves the proven writable pager unchanged while selecting a separate,
 * physically read-only implementation when the database declares readOnly.
 */

const WritablePager = require('./writablePager.js');
const ReadOnlyPager = require('./readOnlyPager.js');

class PagerFacade {
	constructor(filePath) {
		this.filePath = filePath;
		this._db = null;
		this._inner = new WritablePager(filePath);
		return new Proxy(this, {
			get: (target, property, receiver) => target.forwardGet(property, receiver),
			set: (target, property, value, receiver) => target.forwardSet(property, value, receiver)
		});
	}

	get db() {
		return this._db;
	}

	set db(value) {
		this._db = value;
		this._inner.db = value;
	}

	init() {
		const requiresReadOnly = this._db && this._db.options && this._db.options.readOnly === true;
		if (requiresReadOnly && !(this._inner instanceof ReadOnlyPager)) {
			this._inner = new ReadOnlyPager(this.filePath);
			this._inner.db = this._db;
		}
		return this._inner.init();
	}

	forwardGet(property, receiver) {
		if (property in this) {
			const value = Reflect.get(this, property, receiver);
			return typeof value === 'function' ? value.bind(this) : value;
		}
		const value = this._inner[property];
		return typeof value === 'function' ? value.bind(this._inner) : value;
	}

	forwardSet(property, value, receiver) {
		if (property in this) return Reflect.set(this, property, value, receiver);
		this._inner[property] = value;
		return true;
	}
}

module.exports = PagerFacade;
