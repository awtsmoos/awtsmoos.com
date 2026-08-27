// B"H

/**
 * @file api/liveHandle/writer/map_ops/setter.js
 * @chapter The New Branch Is Linked Before The Former Fruit Returns To The Void
 * @description Performs one map inscription with copy-on-write ownership order.
 */

'use strict';

const keyEncoding = require('../../../../utils/keyEncoding.js');
const MapIndexer = require('./indexer.js');
const parseSetOptions = require('./setOptions.js');
const { resolveEffectiveType, resolveSetEngine } = require('./setEngine.js');

class MapSetter {
	constructor(mapWriter) {
		this.writer = mapWriter;
		this.common = mapWriter.common;
		this.builder = mapWriter.builder;
		this.handle = mapWriter.handle;
		this.db = mapWriter.db;
	}

	_resolveEffectiveType() {
		return resolveEffectiveType(this);
	}

	set(key, value, options) {
		return this.db.batch(() => this.performSet(key, value, options));
	}

	performSet(key, value, options) {
		if (!this.builder) {
			throw new Error('B"H Fatal: The Master Builder is absent from the Map Scribe.');
		}
		const flags = parseSetOptions(options);
		const valuePointer = flags.isPointer ? value : this.builder.build(value);
		const encodedKey = keyEncoding.encode(key);
		const structPointer = this.common.resolveStructPtr();
		const { effectiveType, engine } = resolveSetEngine(this, structPointer);
		const path = this.handle.getPath();
		const searchIndexed = !flags.skipIndexes && this.common.getSearchIndex(path);
		const vectorIndexed = !flags.skipIndexes && this.common.getVectorIndex(path);
		const oldState = this.captureOldState(
			engine,
			encodedKey,
			searchIndexed,
			vectorIndexed,
			flags.skipOldState
		);

		engine.set(encodedKey, valuePointer, {
			isPtr: true,
			skipFree: flags.skipFree,
			assumeNew: flags.assumeNew
		});
		this.common.checkAutoCompact(engine, effectiveType);
		this.updateIndexes(
			path,
			key,
			valuePointer,
			value,
			oldState,
			searchIndexed,
			vectorIndexed,
			flags.skipIndexes
		);
		this.releaseFormerValue(oldState.pointer, valuePointer, flags, searchIndexed, vectorIndexed);
		return value;
	}

	captureOldState(engine, encodedKey, searchIndexed, vectorIndexed, skip) {
		if (skip) return { pointer: null, value: null };
		const state = MapIndexer.captureOldState(
			engine,
			encodedKey,
			this.common,
			this.handle,
			searchIndexed,
			vectorIndexed
		);
		return { pointer: state.oldPtr, value: state.oldVal };
	}

	updateIndexes(path, key, valuePointer, value, oldState, searchIndexed, vectorIndexed, skip) {
		if (skip) return;
		MapIndexer.processSet(
			this.db,
			path,
			key,
			valuePointer,
			value,
			oldState.pointer,
			oldState.value,
			searchIndexed,
			vectorIndexed,
			this.common
		);
	}

	releaseFormerValue(oldPointer, newPointer, flags, searchIndexed, vectorIndexed) {
		if (!oldPointer || flags.assumeNew || flags.skipFree || searchIndexed || vectorIndexed) return;
		if (Buffer.isBuffer(newPointer) && Buffer.compare(oldPointer, newPointer) === 0) return;
		this.db.allocator.releasePointer(oldPointer);
	}
}

module.exports = MapSetter;
