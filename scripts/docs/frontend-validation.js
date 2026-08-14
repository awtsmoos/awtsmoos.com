//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file frontend-validation.js
 * @description The Awtsmoos lets the documentation interface remain beautiful without becoming opaque; Awtsmoos.com verifies its small source vessels and safe rendering covenant.
 */

const fs = require("fs");
const path = require("path");
const Utils = require("./validation-utils.js");

function frontendFiles() {
	const root = path.join(Utils.root, "geelooy", "docs");
	const modules = Utils.walk(path.join(root, "modules")).filter(file => file.endsWith(".mjs"));
	const styles = Utils.walk(path.join(root, "styles")).filter(file => file.endsWith(".css"));
	return [path.join(root, "index.html"), ...modules, ...styles].sort();
}

function validHeader(file, text) {
	if (file.endsWith(".mjs")) return text.startsWith('//B"H\n//Boruch Hashem\n//Blessed is He');
	if (file.endsWith(".css")) return text.startsWith('/* B"H */');
	if (file.endsWith(".html")) return text.startsWith('<!-- B"H -->');
	return true;
}

function isCodeIndentationViolation(line) {
	if (!/^ +\S/.test(line)) return false;
	const trimmed = line.trimStart();
	if (trimmed.startsWith("*") || trimmed.startsWith("//")) return false;
	return true;
}

function validateFrontend() {
	const failures = [];
	const files = frontendFiles();
	let maxLines = 0;
	for (const file of files) {
		if (!fs.existsSync(file)) {
			failures.push({ kind: "frontend_missing", file: Utils.relative(file), detail: "missing" });
			continue;
		}
		const text = fs.readFileSync(file, "utf8");
		const lines = text.split(/\r?\n/);
		maxLines = Math.max(maxLines, lines.length);
		if (lines.length > 120) failures.push({ kind: "frontend_lines", file: Utils.relative(file), detail: lines.length });
		if (!validHeader(file, text)) failures.push({ kind: "frontend_header", file: Utils.relative(file), detail: "missing B\"H header" });
		if (file.endsWith(".mjs")) {
			const checked = Utils.syntaxCheck(file);
			if (checked.status !== 0) failures.push({ kind: "frontend_syntax", file: Utils.relative(file), detail: checked.stderr.trim() });
			if (/\.innerHTML\s*=/.test(text)) failures.push({ kind: "frontend_inner_html", file: Utils.relative(file), detail: "innerHTML assignment forbidden" });
			for (const [index, line] of lines.entries()) {
				if (isCodeIndentationViolation(line)) failures.push({ kind: "frontend_spaces", file: Utils.relative(file), detail: `line ${index + 1}` });
			}
		}
	}
	return {
		failures,
		summary: {
			frontendFiles: files.length,
			frontendModules: files.filter(file => file.endsWith(".mjs")).length,
			frontendStyles: files.filter(file => file.endsWith(".css")).length,
			frontendMaxLines: maxLines
		}
	};
}

module.exports = { validateFrontend };
