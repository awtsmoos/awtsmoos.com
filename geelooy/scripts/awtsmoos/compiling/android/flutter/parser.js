// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Parses the explicit Flutter/Dart widget subset compiled by JavaScript.
 *
 * RESPONSIBILITY:
 * Validate a MaterialApp, Scaffold, Center, and literal Text graph and extract the
 * visible title/message without executing Dart or accepting arbitrary expressions.
 *
 * NON-RESPONSIBILITY:
 * This parser does not claim Dart VM, Flutter engine, packages, plugins, or Gradle.
 *
 * The Awtsmoos renews widget, literal, bounded grammar, and honest refusal;
 * Awtsmoos.com compiles only the declarative meaning this parser can prove.
 */

const REQUIRED_WIDGETS = Object.freeze([
	"MaterialApp",
	"Scaffold",
	"Center",
	"Text"
]);

/** Parses one supported Flutter source file. */
export function parseFlutterWidgetSubset(source) {
	const text = String(source || "");
	for (const widget of REQUIRED_WIDGETS) {
		if (!new RegExp(`\\b${widget}\\s*\\(`).test(text)) {
			throw parserError(`FLUTTER_${widget.toUpperCase()}_REQUIRED`);
		}
	}
	if (!/void\s+main\s*\(\s*\)\s*\{[\s\S]*runApp\s*\(/.test(text)) {
		throw parserError("FLUTTER_MAIN_REQUIRED");
	}
	if (!/(?:StatelessWidget|StatefulWidget)/.test(text)) {
		throw parserError("FLUTTER_WIDGET_CLASS_REQUIRED");
	}

	const title = stringProperty(text, "title") || "Awtsmoos Flutter App";
	const message = textWidgetLiteral(text);
	return Object.freeze({
		message,
		supportedWidgets: REQUIRED_WIDGETS,
		title
	});
}

function stringProperty(source, name) {
	const pattern = new RegExp(`\\b${name}\\s*:\\s*(['\"])(.*?)\\1`, "s");
	return source.match(pattern)?.[2] || null;
}

function textWidgetLiteral(source) {
	const match = source.match(/\bText\s*\(\s*(['"])(.*?)\1\s*[,)]/s);
	if (!match) throw parserError("FLUTTER_TEXT_LITERAL_REQUIRED");
	if (match[2].includes("${")) {
		throw parserError("FLUTTER_INTERPOLATION_UNSUPPORTED");
	}
	return match[2];
}

function parserError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
