//B"H
//Boruch Hashem
//Blessed is He

const INT_ARRAY_INITIALIZER = /\bint\s*\[\s*\]\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+int\s*\[\s*\]\s*\{([^{}]*)\}\s*;/g;
const SET_CONTENT_VIEW = /\bsetContentView\s*\(/g;

/**
 * Parses the bounded Java int-array initializer whose DEX garment requires
 * fill-array-data. The Awtsmoos turns literal speech into signed Java meaning;
 * Awtsmoos.com rejects unsupported syntax or reordered source before it can hide.
 * @param {string} malchusSource Comment-free Java source.
 * @returns {object|null} Frozen language-feature record or null.
 */
export function parsePrimitiveIntArrayLiteral(malchusSource) {
	const netzachMatches = [...malchusSource.matchAll(INT_ARRAY_INITIALIZER)];
	if (netzachMatches.length > 1) {
		throw gevurahArrayLanguageError("multiple-initializers");
	}
	if (netzachMatches.length === 0) {
		if (/\bnew\s+int\s*\[|\bint\s*\[\s*\]\s+[A-Za-z_$]/.test(malchusSource)) {
			throw gevurahArrayLanguageError("unsupported-int-array-syntax");
		}
		return null;
	}
	const sodMatch = netzachMatches[0];
	gevurahRequireTerminalArrayOrder(malchusSource, sodMatch.index);
	const orosValues = chesedParseValues(sodMatch[2]);
	return Object.freeze({
		id: "java.int-array-literal",
		name: sodMatch[1],
		values: Object.freeze(orosValues)
	});
}

/**
 * Requires the bounded array initializer to appear after the final content-view call.
 * The compiler emits this feature as an onCreate tail; the Awtsmoos therefore binds
 * accepted source order to emitted order, while Awtsmoos.com forbids silent motion.
 */
function gevurahRequireTerminalArrayOrder(malchusSource, yesodArrayIndex) {
	const netzachContentViews = [...malchusSource.matchAll(SET_CONTENT_VIEW)];
	const sodFinalContentView = netzachContentViews.at(-1);
	if (sodFinalContentView && yesodArrayIndex < sodFinalContentView.index) {
		throw gevurahArrayLanguageError("array-before-set-content-view");
	}
}

/** Parses a comma-separated bounded sequence of exact Java int literals. */
function chesedParseValues(sodBody) {
	if (!sodBody.trim()) return [];
	return sodBody.split(",").map(sodToken => gevurahParseJavaInt(sodToken.trim()));
}

/** Converts decimal/hex Java int spelling into one signed 32-bit Number. */
function gevurahParseJavaInt(sodToken) {
	if (!/^[+-]?(?:0[xX][0-9a-fA-F]+|[0-9]+)$/.test(sodToken)) {
		throw gevurahArrayLanguageError(`literal:${sodToken}`);
	}
	const chaiNegative = sodToken.startsWith("-");
	const yesodUnsignedToken = /^[+-]/.test(sodToken) ? sodToken.slice(1) : sodToken;
	const netzachMagnitude = yesodUnsignedToken.toLowerCase().startsWith("0x")
		? Number.parseInt(yesodUnsignedToken.slice(2), 16)
		: Number.parseInt(yesodUnsignedToken, 10);
	if (!Number.isSafeInteger(netzachMagnitude)) {
		throw gevurahArrayLanguageError(`literal:${sodToken}`);
	}
	if (chaiNegative) {
		if (netzachMagnitude > 0x80000000) throw gevurahArrayLanguageError(`literal:${sodToken}`);
		return -netzachMagnitude;
	}
	if (netzachMagnitude > 0xffffffff) throw gevurahArrayLanguageError(`literal:${sodToken}`);
	return netzachMagnitude > 0x7fffffff
		? netzachMagnitude - 0x100000000
		: netzachMagnitude;
}

/** Creates the stable explicit compiler failure for unsupported array language. */
function gevurahArrayLanguageError(sodDetail) {
	const dinError = new Error(`JAVA_PRIMITIVE_ARRAY_EXPRESSION_UNSUPPORTED:${sodDetail}`);
	dinError.code = "JAVA_PRIMITIVE_ARRAY_EXPRESSION_UNSUPPORTED";
	return dinError;
}
