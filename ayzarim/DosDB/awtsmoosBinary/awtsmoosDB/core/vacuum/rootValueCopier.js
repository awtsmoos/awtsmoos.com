// B"H

/**
 * @file core/vacuum/rootValueCopier.js
 * @chapter A Living List Crosses Record By Record Instead Of Becoming One Stone
 * @description
 * Preserves sequence-backed root lists through bounded destination splices, then
 * copies every named list property. The proven low-growth load pattern therefore
 * remains semantically complete rather than trading metadata for density.
 */

const constants = require('../../constants.js');
const cloneValue = require('./valueCloner.js');

function copyRootValue(key, sourceValue, context, options = {}) {
	const internals = sourceValue && sourceValue[constants.SYMBOLS.INTERNALS];
	if (internals?.type === constants.VAL_TYPE.SEQUENCE) {
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
		const chunk = [];
		const end = Math.min(total, offset + chunkSize);
		for (let index = offset; index < end; index++) {
			chunk.push(cloneValue(sourceValue[index], context));
		}
		destinationList.splice(Number(destinationList.length || 0), 0, ...chunk);
		context.destination.waitForIdle();
		if (typeof options.onProgress === 'function') {
			options.onProgress({
				key,
				strategy: 'bounded-sequence-copy',
				loaded: end,
				total
			});
		}
	}

	const propertyCount = copySequenceProperties(sourceValue, destinationList, context, total);
	context.destination.waitForIdle();
	return {
		strategy: 'bounded-sequence-copy',
		records: total,
		chunkSize,
		properties: propertyCount
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

function isElementIndex(property, total) {
	const text = String(property);
	if (!/^(0|[1-9]\d*)$/.test(text)) return false;
	const index = Number(text);
	return Number.isSafeInteger(index) && index >= 0 && index < total;
}

module.exports = copyRootValue;
