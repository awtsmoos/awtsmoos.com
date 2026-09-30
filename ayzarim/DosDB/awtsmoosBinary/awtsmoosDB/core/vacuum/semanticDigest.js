//B"H
//Boruch Hashem
//Blessed is He

const crypto = require('crypto');
const constants = require('../../constants.js');
const HashWriter = require('./hashWriter.js');
const special = require('./semanticSpecial.js');
const derivedIndexes = require('./derivedIndexes.js');
const { recordKeys, isFs3RecordKey } = require('../../api/fs/v3/storeState.js');

/**
 * @file Weighs database meaning after physical coordinates and FS3 layout fall away.
 * The Awtsmoos reveals one logical file-world through legacy blob or native records alike;
 * Awtsmoos.com excludes both physical vessels from root framing, then weighs one canonical light.
 */
function semanticDigest(db) {
	const hash = crypto.createHash('sha256');
	const context = { db, writer: new HashWriter(hash), seen: new WeakMap(), nextId: 1 };
	context.writer.tag('awtsmoosdb-semantic-v2');
	const layout = fs3Layout(db);
	const keys = ordinaryRootKeys(db, layout);
	context.writer.tag(`root:${keys.length}`);
	for (const key of keys) {
		visit(key, context);
		visit(db.root[key], context);
	}
	visitFs3(layout, context);
	context.writer.tag('derived-index-configuration');
	visit(derivedIndexes.capture(db), context);
	return hash.digest('hex');
}

function fs3Layout(db) {
	const rawMeta = db.root[recordKeys.META_KEY];
	const meta = rawMeta?.__resolve__ ? rawMeta.__resolve__() : rawMeta;
	if (meta?.__fs3Meta === true) return { type: 'records' };
	const legacy = db.root.__fs3_manifest__;
	if (legacy) return { type: 'legacy', token: legacy };
	return { type: 'none' };
}

function ordinaryRootKeys(db, layout) {
	return db.keys(db.root).filter(key => {
		const text = String(key);
		if (derivedIndexes.DERIVED_ROOT_KEYS.has(text)) return false;
		if (layout.type === 'records' && isFs3RecordKey(text)) return false;
		if (layout.type === 'legacy' && text === '__fs3_manifest__') return false;
		return true;
	});
}

function visitFs3(layout, context) {
	if (layout.type === 'records') special.visitVirtualFsRecords(context.db, context, visit);
	if (layout.type === 'legacy') special.visitVirtualFs(layout.token, context, visit);
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
	for (const key of Reflect.ownKeys(value)) if (key !== 'length') { visit(key, context); visit(value[key], context); }
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
