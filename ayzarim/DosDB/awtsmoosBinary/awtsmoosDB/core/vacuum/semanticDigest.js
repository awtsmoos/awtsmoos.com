// B"H

/**
 * @file core/vacuum/semanticDigest.js
 * @chapter Coordinates Fall Away And Meaning Alone Is Weighed
 * @description
 * Digests logical values, hidden bodies, and canonical index configuration while
 * excluding pointer-bearing derived search and HNSW storage.
 */

const crypto = require('crypto');
const constants = require('../../constants.js');
const HashWriter = require('./hashWriter.js');
const special = require('./semanticSpecial.js');
const derivedIndexes = require('./derivedIndexes.js');
const { recordKeys, isFs3RecordKey, LEGACY_MANIFEST_KEY } = require('../../api/fs/v3/storeState.js');

function isFs3PhysicalKey(key) {
	const text = String(key);
	return text === LEGACY_MANIFEST_KEY || isFs3RecordKey(text);
}

function semanticDigest(db) {
	const hash = crypto.createHash('sha256');
	const context = { db, writer: new HashWriter(hash), seen: new WeakMap(), nextId: 1 };
	context.writer.tag('awtsmoosdb-semantic-v2');
	const keys = db.keys(db.root).filter(key => !derivedIndexes.DERIVED_ROOT_KEYS.has(String(key)));
	const meta = db.root[recordKeys.META_KEY];
	const hasRecordStore = meta && meta.__fs3Meta === true;
	const legacyTokenKey = hasRecordStore ? null : keys.find(key => String(key) === LEGACY_MANIFEST_KEY) || null;
	// Both physical layouts collapse to exactly one logical virtual-filesystem
	// entry: the per-inode records and the legacy blob token never appear as
	// root keys in the digest, so a layout migration compares equal.
	const walkKeys = keys.filter(key => !isFs3PhysicalKey(key));
	context.writer.tag(`root:${walkKeys.length + (hasRecordStore || legacyTokenKey ? 1 : 0)}`);
	for (const key of walkKeys) { visit(key, context); visit(db.root[key], context); }
	if (hasRecordStore) {
		special.visitVirtualFsRecords(db, context, visit);
	} else if (legacyTokenKey) {
		visit(db.root[legacyTokenKey], context);
	}
	context.writer.tag('derived-index-configuration');
	visit(derivedIndexes.capture(db), context);
	return hash.digest('hex');
}

function visit(value, context) {
	const type = typeof value;
	if (value === null) return context.writer.tag('null');
	if (type === 'undefined') return context.writer.tag('undefined');
	if (type === 'boolean') return context.writer.tag(`boolean:${value}`);
	if (type === 'string') return context.writer.tag(`string:${value}`);
	if (type === 'number') return context.writer.number(value);
	if (type === 'bigint') return context.writer.tag(`bigint:${value}`);
	if (type === 'symbol') return context.writer.tag(`symbol:${Symbol.keyFor(value) || value.description || ''}`);
	if (type === 'function' && !value[constants.SYMBOLS.INTERNALS]) return context.writer.tag(`function:${value.toString()}`);
	const soul = value && value[constants.SYMBOLS.INTERNALS];
	if (soul && value.__resolve__) return visit(value.__resolve__(), context);
	if (value.__fs3ManifestBlob === true) return special.visitVirtualFs(value, context, visit);
	if (value.__awtsmoosBlob === true) return special.visitBlob(value, context, visit);
	if (value.__awtsmoosText === true) return special.visitText(value, context, visit);
	if (Buffer.isBuffer(value)) { context.writer.tag('buffer'); return context.writer.bytes(value); }
	if (value instanceof Date) return context.writer.tag(`date:${value.toISOString()}`);
	if (value instanceof RegExp) return context.writer.tag(`regexp:${value.source}/${value.flags}`);
	if (value instanceof ArrayBuffer) return visit(Buffer.from(value), context);
	if (ArrayBuffer.isView(value)) {
		context.writer.tag(`typed:${value.constructor.name}`);
		return context.writer.bytes(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
	}
	if (context.seen.has(value)) return context.writer.tag(`ref:${context.seen.get(value)}`);
	context.seen.set(value, context.nextId++);
	if (Array.isArray(value)) return visitArray(value, context);
	if (value instanceof Map) return visitMap(value, context);
	if (value instanceof Set) return visitSet(value, context);
	return visitObject(value, context);
}

function visitArray(value, context) {
	context.writer.tag(`array:${value.length}`);
	for (const key of Reflect.ownKeys(value)) {
		if (key === 'length') continue;
		visit(key, context);
		visit(value[key], context);
	}
}

function visitMap(value, context) {
	context.writer.tag(`map:${value.size}`);
	for (const [key, item] of value.entries()) { visit(key, context); visit(item, context); }
}

function visitSet(value, context) {
	context.writer.tag(`set:${value.size}`);
	for (const item of value.values()) visit(item, context);
}

function visitObject(value, context) {
	const keys = Reflect.ownKeys(value);
	context.writer.tag(`object:${value.constructor?.name || 'null'}:${keys.length}`);
	for (const key of keys) { visit(key, context); visit(value[key], context); }
}

module.exports = semanticDigest;
