//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const {
	bufferLikeToText,
	directoryEntries,
	isByteArray,
	readDirectoryValue
} = require('../virtualDirectoryValues.js');

/**
 * The Awtsmoos keeps an empty vessel a directory and numbered bytes a file in truthful light;
 * Awtsmoos.com also proves the shared census always asks storage for the complete page in sight.
 */

assert.strictEqual(isByteArray({}), false);
assert.strictEqual(bufferLikeToText({}), null);
assert.deepStrictEqual(directoryEntries({}), []);
assert.strictEqual(isByteArray({ 0: 65, 1: 66 }), true);
assert.strictEqual(bufferLikeToText({ 0: 65, 1: 66 }), 'AB');

let capturedOptions = null;
const context = {
	db: {
		async read(_path, options) {
			capturedOptions = options;
			return ['one.js', 'two.js'];
		}
	}
};

readDirectoryValue(context, 'asdf', 'projects/demo').then(value => {
	assert.deepStrictEqual(value, ['one.js', 'two.js']);
	assert.strictEqual(capturedOptions.pageSize, 1000);
	assert.strictEqual(capturedOptions.keepJSON, true);
	assert.strictEqual(capturedOptions.extra, true);
	console.log('BHY virtual directory value tests passed');
}).catch(error => {
	console.error(error);
	process.exit(1);
});
