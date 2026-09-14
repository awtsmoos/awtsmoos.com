//B"H
//Boruch Hashem
//Blessed be He

const {
	compileSourceFilesToApp,
	compileSourceFilesToMode2
} = require("../merkava-binary/SourceAppCompiler.js");
const {
	decodeMode2App,
	runMode2App
} = require("../merkava-binary/Mode2AppBinary.js");
const {
	decodeUnifiedApp,
	runUnifiedApp
} = require("../merkava-binary/UnifiedAppBinary.js");
const {
	compileSourceFilesToNativeWebV4
} = require("../merkava-binary/NativeWebV4SourceCompiler.js");
const {
	decodeNativeWebV4
} = require("../merkava-binary/NativeWebV4Decoder.js");
const {
	runNativeWebV4
} = require("../merkava-binary/NativeWebV4Runtime.js");

/**
 * Transitional engines preserve working historical executors behind the one
 * canonical outer garment. Native web v4 is self-contained and portable: its
 * string pool, DOM handles, styles, and event primitive travel in the payload.
 */
const TRANSITION_ENGINES = Object.freeze({
	"mapp-transition": Object.freeze({
		compile: compileSourceFilesToApp,
		decode: decodeUnifiedApp,
		run: runUnifiedApp
	}),
	"mode2-transition": Object.freeze({
		compile: compileSourceFilesToMode2,
		decode: decodeMode2App,
		run: runMode2App
	}),
	"native-web-v4": Object.freeze({
		compile: compileSourceFilesToNativeWebV4,
		decode: decodeNativeWebV4,
		run: runNativeWebV4
	})
});

/**
 * Resolves one explicitly named transitional execution engine.
 * @param {string} encoding Manifest program encoding.
 * @returns {{compile:Function,decode:Function,run:Function}} Engine contract.
 */
function transitionEngine(encoding) {
	const engine = TRANSITION_ENGINES[encoding];
	if (!engine) {
		throw new Error(`merkava_transition_engine:${encoding}`);
	}
	return engine;
}

module.exports = {
	TRANSITION_ENGINES,
	transitionEngine
};
