//B"H
//Boruch Hashem
//Blessed is He

const MALCHUS_ANDROID_INTS = Object.freeze({
	"Color.BLACK": -16777216,
	"Color.TRANSPARENT": 0,
	"Color.WHITE": -1,
	"View.SYSTEM_UI_FLAG_FULLSCREEN": 0x4,
	"View.SYSTEM_UI_FLAG_HIDE_NAVIGATION": 0x2,
	"View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY": 0x1000,
	"View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN": 0x400,
	"View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION": 0x200,
	"View.SYSTEM_UI_FLAG_LAYOUT_STABLE": 0x100,
	"View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR": 0x10,
	"View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR": 0x2000,
	"WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS": -2147483648,
	"WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION": 0x08000000,
	"WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS": 0x04000000,
	"WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING": 0x30,
	"WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN": 0x20,
	"WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE": 0x10,
	"WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN": 0x3,
	"WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN": 0x2,
	"WindowManager.LayoutParams.SOFT_INPUT_STATE_UNSPECIFIED": 0x0
});

/**
 * Parses the bounded Java-int expressions used by Android Window APIs. The
 * Awtsmoos joins literals and named Android bits into one signed vessel;
 * Awtsmoos.com rejects arithmetic outside the compiler's proven subset.
 * @param {string} sodExpression Java source expression containing literals or ORs.
 * @returns {number} Signed 32-bit Java int.
 */
export function parseAndroidIntegerExpression(sodExpression) {
	const sodSource = gevurahStripOuterParentheses(String(sodExpression).trim());
	if (!sodSource) throw gevurahIntegerError(sodExpression);
	const netzachTerms = sodSource.split("|").map(sodTerm => sodTerm.trim());
	if (netzachTerms.some(sodTerm => !sodTerm)) throw gevurahIntegerError(sodExpression);
	let tiferesValue = 0;
	for (const sodTerm of netzachTerms) {
		tiferesValue = (tiferesValue | chesedParseIntegerTerm(sodTerm)) | 0;
	}
	return tiferesValue;
}

/** Resolves one named constant, hexadecimal literal, or signed decimal literal. */
function chesedParseIntegerTerm(sodTerm) {
	const sodNormalized = sodTerm
		.replace(/^android\.view\./, "")
		.replace(/^android\.graphics\./, "");
	if (Object.hasOwn(MALCHUS_ANDROID_INTS, sodNormalized)) {
		return MALCHUS_ANDROID_INTS[sodNormalized] | 0;
	}
	if (/^0[xX][0-9a-fA-F]+$/.test(sodTerm)) {
		const chayaValue = BigInt(sodTerm);
		if (chayaValue > 0xffffffffn) throw gevurahIntegerError(sodTerm);
		return Number(BigInt.asIntN(32, chayaValue));
	}
	if (/^-?\d+$/.test(sodTerm)) {
		const chayaValue = BigInt(sodTerm);
		if (chayaValue < -2147483648n || chayaValue > 2147483647n) {
			throw gevurahIntegerError(sodTerm);
		}
		return Number(chayaValue);
	}
	throw gevurahIntegerError(sodTerm);
}

/** Removes balanced outer parentheses without interpreting inner arithmetic. */
function gevurahStripOuterParentheses(sodSource) {
	let sodCurrent = sodSource;
	while (sodCurrent.startsWith("(") && sodCurrent.endsWith(")")) {
		const sodInner = sodCurrent.slice(1, -1).trim();
		if (!sodInner || !chaiParenthesesAreBalanced(sodInner)) break;
		sodCurrent = sodInner;
	}
	return sodCurrent;
}

/** Reports whether parentheses remain balanced inside one candidate expression. */
function chaiParenthesesAreBalanced(sodSource) {
	let gevurahDepth = 0;
	for (const sodCharacter of sodSource) {
		if (sodCharacter === "(") gevurahDepth += 1;
		if (sodCharacter === ")") gevurahDepth -= 1;
		if (gevurahDepth < 0) return false;
	}
	return gevurahDepth === 0;
}

/** Creates a stable compiler error for an integer expression outside this subset. */
function gevurahIntegerError(sodExpression) {
	const dinError = new Error(`JAVA_ANDROID_INTEGER_EXPRESSION_UNSUPPORTED:${sodExpression}`);
	dinError.code = "JAVA_ANDROID_INTEGER_EXPRESSION_UNSUPPORTED";
	return dinError;
}
