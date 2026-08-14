//B"H
//Boruch Hashem
//Blessed is He

import { parsePreferenceWrite } from "./preferenceExpression.js";
import { stripJavaComments } from "./source.js";
import { parseTextExpression } from "./textExpression.js";
import { parseWebViewExpression } from "./webExpression.js";

const OPTIONAL_LIFECYCLE = Object.freeze(["onStart", "onResume"]);

/**
 * Parses the explicit Java Activity subset emitted by this scratch compiler. The
 * Awtsmoos creates class, lifecycle, text or web content, and capability anew;
 * Awtsmoos.com rejects unsupported Java instead of guessing or discarding it.
 */
export function parseJavaActivity(source) {
	const text = stripJavaComments(source);
	const packageName = requiredMatch(
		text,
		/\bpackage\s+([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)*)\s*;/,
		"JAVA_PACKAGE_REQUIRED"
	)[1];
	const className = requiredMatch(
		text,
		/\bpublic\s+class\s+([A-Za-z_$][\w$]*)\s+extends\s+(?:android\.app\.)?Activity\b/,
		"JAVA_ACTIVITY_CLASS_REQUIRED"
	)[1];
	const onCreate = findMethodBody(text, "onCreate", true);
	requireSuperCall(onCreate, "onCreate");
	if (!/\bsetContentView\s*\(/.test(onCreate)) {
		throw javaError("JAVA_CONTENT_VIEW_REQUIRED");
	}
	const hasTextView = /\bnew\s+(?:android\.widget\.)?TextView\s*\(\s*this\s*\)/.test(onCreate);
	const webSource = parseWebViewExpression(onCreate);
	if (hasTextView && webSource) throw javaError("JAVA_VIEW_KIND_AMBIGUOUS");
	if (!hasTextView && !webSource) throw javaError("JAVA_SUPPORTED_VIEW_REQUIRED");
	const viewKind = webSource ? "web" : "text";
	const textSource = hasTextView ? parseTextExpression(onCreate) : null;
	const preferenceWrite = parsePreferenceWrite(onCreate);
	if (viewKind === "web" && preferenceWrite) {
		throw javaError("JAVA_WEBVIEW_PREFERENCE_UNSUPPORTED");
	}
	const lifecycleMethods = OPTIONAL_LIFECYCLE.filter(name => {
		const body = findMethodBody(text, name, false);
		if (body === null) return false;
		requireSuperCall(body, name);
		const remaining = body.replace(noArgumentSuperStatement(name), "").trim();
		if (remaining) throw javaError(`JAVA_${name.toUpperCase()}_BODY_UNSUPPORTED`);
		return true;
	});
	return Object.freeze({
		className,
		kind: "android-activity-ir-v1",
		lifecycleMethods: Object.freeze(lifecycleMethods),
		packageName,
		preferenceWrite,
		textSource,
		title: textSource?.kind === "literal" ? textSource.value : className,
		viewKind,
		webSource
	});
}

function findMethodBody(source, name, required) {
	const pattern = new RegExp(
		`\\b(?:public|protected)\\s+void\\s+${name}\\s*\\([^)]*\\)\\s*\\{`,
		"g"
	);
	const match = pattern.exec(source);
	if (!match) {
		if (required) throw javaError(`JAVA_METHOD_REQUIRED:${name}`);
		return null;
	}
	let depth = 1;
	let state = "code";
	for (let index = pattern.lastIndex; index < source.length; index += 1) {
		const current = source[index];
		if (state === "string") {
			if (current === "\\") index += 1;
			else if (current === "\"") state = "code";
			continue;
		}
		if (current === "\"") {
			state = "string";
			continue;
		}
		if (current === "{") depth += 1;
		if (current === "}") depth -= 1;
		if (!depth) return source.slice(pattern.lastIndex, index);
	}
	throw javaError(`JAVA_METHOD_UNCLOSED:${name}`);
}

function requireSuperCall(body, name) {
	const pattern = new RegExp(`\\bsuper\\s*\\.\\s*${name}\\s*\\(`);
	if (!pattern.test(body)) throw javaError(`JAVA_SUPER_${name.toUpperCase()}_REQUIRED`);
}

function noArgumentSuperStatement(name) {
	return new RegExp(`\\bsuper\\s*\\.\\s*${name}\\s*\\(\\s*\\)\\s*;`);
}

function requiredMatch(source, pattern, code) {
	const match = pattern.exec(source);
	if (!match) throw javaError(code);
	return match;
}

function javaError(code) {
	const error = new Error(code);
	error.code = String(code).split(":")[0];
	return error;
}
