// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/vacuum/rootValueCopier.js
 * @chapter The Anchored River Is Recognized Before It Crosses
 * @description
 * Resolves the source handle before choosing a copy strategy, so an anchored
 * list is seen through its effective sequence type. Records cross in bounded
 * chunks and named metadata follows afterward. The Awtsmoos preserves both the
 * river and its names without collapsing them into one bloated assignment.
 */

const constants = require('../../constants.js');
const cloneValue = require('./valueCloner.js');

function copyRootValue(key, sourceValue, context, options = {}) {
	const internals = sourceValue && sourceValue[constants.SYMBOLS.INTERNALS];
	if (internals && typeof internals.ensureResolved === 'function') {
		internals.ensureResolved();
	}
	if (isSequenceType(internals && internals.type)) {
		return copySequence(key, sourceValue, context, options);
	}
	context.destination.root[key] = cloneValue(sourceValue, context);
	context.destination.waitForIdle();
	return { strategy: 'single-logical-value', records: null };
}

function copySequence(key, sourceValue, context, options) {
	const chunkSize = Math.max(1, Number(options.listChunkSize || 250));
	context.destination.createList(context.destination.root, key);
	const destinationList = context.destination.root[key];
	const total = Number(sourceValue.length || 0);

	for (let offset = 0; offset < total; offset += chunkSize) {
		const end = Math.min(total, offset + chunkSize);
		const chunk = [];
		for (let index = offset; index < end; index++) {
			chunk.push(cloneValue(sourceValue[index], context));
		}
		destinationList.splice(Number(destinationList.length || 0), 0, ...chunk);
		context.destination.waitForIdle();
		reportProgress(options, key, end, total);
	}

	const properties = copySequenceProperties(sourceValue, destinationList, context, total);
	context.destination.waitForIdle();
	return {
		strategy: 'bounded-sequence-copy',
		records: total,
		chunkSize,
		properties
	};
}

function copySequenceProperties(sourceValue, destinationValue, context, total) {
	let copied = 0;
	for (const property of context.source.keys(sourceValue)) {
		if (property === 'length' || isElementIndex(property, total)) continue;
		destinationValue[property] = cloneValue(sourceValue[property], context);
		copied++;
	}
	return copied;
}

function isSequenceType(type) {
	return [
		constants.VAL_TYPE.SEQUENCE,
		constants.VAL_TYPE.ARRAY,
		constants.VAL_TYPE.SMART_ARRAY,
		constants.VAL_TYPE.SET,
		constants.VAL_TYPE.JS_SET
	].includes(type);
}

function isElementIndex(property, total) {
	const text = String(property);
	if (!/^(0|[1-9]\d*)$/.test(text)) return false;
	const index = Number(text);
	return Number.isSafeInteger(index) && index >= 0 && index < total;
}

function reportProgress(options, key, loaded, total) {
	if (typeof options.onProgress !== 'function') return;
	options.onProgress({ key, strategy: 'bounded-sequence-copy', loaded, total });
}

module.exports = copyRootValue;
