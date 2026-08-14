// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Parses the explicit Kotlin Activity subset compiled by the JavaScript toolchain.
 *
 * RESPONSIBILITY:
 * Validate package, Activity class, TextView construction, literal text assignment,
 * and setContentView wiring without executing Kotlin or accepting arbitrary syntax.
 *
 * NON-RESPONSIBILITY:
 * This parser does not claim Kotlin/JVM, coroutines, Gradle, or Android SDK parity.
 *
 * The Awtsmoos renews Kotlin letter, bounded grammar, and honest refusal together;
 * Awtsmoos.com compiles only the syntax whose meaning this JavaScript parser proves.
 */

/** Parses one supported Kotlin Activity source record. */
export function parseKotlinActivity(source) {
	const text = String(source || "");
	const packageName = capture(text, /^\s*package\s+([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)/m, "KOTLIN_PACKAGE_REQUIRED");
	const className = capture(
		text,
		/class\s+([A-Za-z_]\w*)\s*:\s*Activity\s*\(\s*\)/,
		"KOTLIN_ACTIVITY_CLASS_REQUIRED"
	);
	const viewName = capture(
		text,
		/val\s+([A-Za-z_]\w*)\s*=\s*TextView\s*\(\s*this\s*\)/,
		"KOTLIN_TEXT_VIEW_REQUIRED"
	);
	const textLiteral = captureKotlinString(
		text,
		new RegExp(`${escapePattern(viewName)}\\.text\\s*=\\s*(\"(?:\\\\.|[^\"])*\")`),
		"KOTLIN_TEXT_LITERAL_REQUIRED"
	);
	const contentView = capture(
		text,
		/setContentView\s*\(\s*([A-Za-z_]\w*)\s*\)/,
		"KOTLIN_CONTENT_VIEW_REQUIRED"
	);

	if (contentView !== viewName) {
		throw parserError("KOTLIN_CONTENT_VIEW_MISMATCH");
	}
	if (!/override\s+fun\s+onCreate\s*\(/.test(text)) {
		throw parserError("KOTLIN_ON_CREATE_REQUIRED");
	}

	return Object.freeze({
		className,
		packageName,
		text: textLiteral,
		viewName
	});
}

function capture(source, pattern, code) {
	const match = source.match(pattern);
	if (!match) throw parserError(code);
	return match[1];
}

function captureKotlinString(source, pattern, code) {
	const literal = capture(source, pattern, code);
	try {
		return JSON.parse(literal);
	} catch {
		throw parserError("KOTLIN_STRING_INVALID");
	}
}

function escapePattern(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parserError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
