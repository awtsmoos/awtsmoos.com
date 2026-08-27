// B"H

/**
 * @file core/vacuum/valueCloner.js
 * @chapter Forms Are Recreated, Not Dragged By Their Old Coordinates
 * @description
 * Clones hydrated logical values, preserving cycles and native semantic types.
 * Physical pointer coordinates are never copied into the new database.
 */

const constants = require('../../constants.js');
const { cloneBlob, cloneText } = require('./specialTokens.js');
const cloneVirtualFsManifest = require('./virtualFsManifest.js');

function cloneValue(value, context) {
	if (value === null || typeof value !== 'object' && typeof value !== 'function') return value;
	const soul = value && value[constants.SYMBOLS.INTERNALS];
	if (soul && value.__resolve__) return cloneValue(value.__resolve__(), context);
	if (value.__fs3ManifestBlob === true) return cloneVirtualFsManifest(value, context, cloneValue);
	if (value.__awtsmoosBlob === true) return cloneBlob(value, context, cloneValue);
	if (value.__awtsmoosText === true) return cloneText(value, context, cloneValue);
	if (Buffer.isBuffer(value)) return Buffer.from(value);
	if (value instanceof Date) return new Date(value.getTime());
	if (value instanceof RegExp) return new RegExp(value.source, value.flags);
	if (value instanceof ArrayBuffer) return value.slice(0);
	if (ArrayBuffer.isView(value)) return new value.constructor(value);
	if (typeof value === 'function') return value;
	if (context.seen.has(value)) return context.seen.get(value);

	if (Array.isArray(value)) return cloneArray(value, context);
	if (value instanceof Map) return cloneMap(value, context);
	if (value instanceof Set) return cloneSet(value, context);
	if (value instanceof Error) return cloneError(value, context);
	return cloneObject(value, context);
}

function cloneArray(value, context) {
	const output = new Array(value.length);
	context.seen.set(value, output);
	for (const key of Reflect.ownKeys(value)) {
		if (key === 'length') continue;
		output[key] = cloneValue(value[key], context);
	}
	return output;
}

function cloneMap(value, context) {
	const output = new Map();
	context.seen.set(value, output);
	for (const [key, item] of value.entries()) output.set(cloneValue(key, context), cloneValue(item, context));
	return output;
}

function cloneSet(value, context) {
	const output = new Set();
	context.seen.set(value, output);
	for (const item of value.values()) output.add(cloneValue(item, context));
	return output;
}

function cloneError(value, context) {
	const output = new value.constructor(value.message);
	context.seen.set(value, output);
	output.name = value.name;
	output.stack = value.stack;
	for (const key of Reflect.ownKeys(value)) output[key] = cloneValue(value[key], context);
	return output;
}

function cloneObject(value, context) {
	const prototype = Object.getPrototypeOf(value);
	const output = Object.create(prototype === null ? null : prototype);
	context.seen.set(value, output);
	for (const key of Reflect.ownKeys(value)) output[key] = cloneValue(value[key], context);
	return output;
}

module.exports = cloneValue;
