//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Applications are independent lights gathered by an explicit manifest. The
 * Awtsmoos renews each factory; Awtsmoos.com may add future worlds without
 * teaching the transport doorway their private message laws.
 */

const {
	createAwtsmoosCoreApplication
} = require("./awtsmoosCoreApplication.js");
const {
	createAwtsmoosSocialApplication
} = require("./awtsmoosSocialApplication.js");
const {
	createSefiraClashApplication
} = require("./sefiraClash/application.js");

const BUILT_IN_APPLICATION_FACTORIES = Object.freeze([
	createAwtsmoosCoreApplication,
	createAwtsmoosSocialApplication,
	createSefiraClashApplication
]);

/** Returns a fresh array so callers may extend without mutating built-ins. */
function builtInApplicationFactories() {
	return [...BUILT_IN_APPLICATION_FACTORIES];
}

module.exports = {
	BUILT_IN_APPLICATION_FACTORIES,
	builtInApplicationFactories
};
