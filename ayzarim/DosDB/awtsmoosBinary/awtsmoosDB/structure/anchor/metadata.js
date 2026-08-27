// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file structure/anchor/metadata.js
 * @chapter Names Rest Beside The Moving River
 * @description
 * Provides one dictionary of named properties beside an anchored structure.
 * The dictionary is linked into the stable anchor before former pointers are
 * retired, so verified free-space reuse never mistakes a living name for empty
 * space. The Awtsmoos renews both the ordered sequence and its remembered names.
 */

const StableAnchor = require('./stable.js');
const DictionaryEngine = require('../dictionary/index.js');
const toKeyBytes = require('../dictionary/logic/keyBytes.js');
const Pointer = require('../../utils/pointer/crown.js');

class AnchorMetadata {
	constructor(db, anchorSeal) {
		this.db = db;
		this.anchorSeal = anchorSeal;
		this.anchor = new StableAnchor(db);
	}

	getPtr(key) {
		const dictionary = this._dictionary(false);
		return dictionary ? dictionary.getPtr(toKeyBytes(key)) : null;
	}

	*keys() {
		const dictionary = this._dictionary(false);
		if (!dictionary) return;
		yield* dictionary.keys();
	}

	set(key, valuePointer, options = {}) {
		const previousSeal = this.anchor.metadataSeal(this.anchorSeal);
		const dictionary = this._dictionary(true);
		const previousValue = dictionary.getPtr(toKeyBytes(key));
		const newSeal = dictionary.set(String(key), valuePointer, {
			isPtr: true,
			assumeNew: options.assumeNew === true,
			skipFree: options.skipFree === true
		});

		this.anchor.updateMetadata(this.anchorSeal, newSeal);
		this._releaseChanged(previousSeal, newSeal, options.skipFree);
		this._releaseChanged(previousValue, valuePointer, options.skipFree);
		return valuePointer;
	}

	delete(key, options = {}) {
		const previousSeal = this.anchor.metadataSeal(this.anchorSeal);
		if (!previousSeal) return false;
		const dictionary = this._dictionary(false);
		const previousValue = dictionary.getPtr(toKeyBytes(key));
		if (!previousValue || !dictionary.delete(String(key))) return false;

		const newSeal = dictionary.seal();
		this.anchor.updateMetadata(this.anchorSeal, newSeal);
		this._releaseChanged(previousSeal, newSeal, options.skipFree);
		this._releaseChanged(previousValue, null, options.skipFree);
		return true;
	}

	_dictionary(create) {
		const seal = this.anchor.metadataSeal(this.anchorSeal);
		if (!seal && !create) return null;
		return new DictionaryEngine(this.db.allocator, seal || null);
	}

	_releaseChanged(previous, current, skipFree) {
		if (skipFree || !previous) return;
		if (current && this._samePointer(previous, current)) return;
		this.db.allocator.releasePointer(previous);
	}

	_samePointer(left, right) {
		const leftBuffer = Pointer.toBuffer(left);
		const rightBuffer = Pointer.toBuffer(right);
		return leftBuffer.length === rightBuffer.length && Buffer.compare(leftBuffer, rightBuffer) === 0;
	}
}

module.exports = AnchorMetadata;
