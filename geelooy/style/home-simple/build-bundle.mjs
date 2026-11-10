// B"H — Build the homepage CSS bundle from its original source files.
// The bundle is a BUILD ARTIFACT: never hand-edit home-bundle.css.
// Regenerate it with: node geelooy/style/home-simple/build-bundle.mjs
// Resolves @import url(...) recursively. A file is inlined ONCE per whole
// bundle (global dedup); a repeat import is dropped, leaving only the blank
// line the surrounding newlines create. Emits:
//   /* ===== <repo-relative-path> ===== */  for each top-level file
//   /* === inlined: <path-as-written> === */  for each resolved import
// The ?v= cache query is stripped from the marker (it is not part of the path).
// A blank line precedes every inlined marker; two blank lines precede every
// top-level marker after the first. Usage: node build-bundle.mjs [outPath]
//
// FAST LOADING (Coby, Nov 8 — CSS must never slow the page): source
// comments are STRIPPED from the bundle at build time (string-aware, so
// `content: "/*"` and url("...") values are never touched). The sources
// keep every comment; only the served bundle drops them. That cuts the
// bundle ~25% raw and ~33% gzipped. The builder's own markers (the
// ===== / inlined: lines) and the B"H header below are added AFTER
// stripping, so file traceability is preserved.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(SCRIPT_DIR, "../../..");
const TOP = [
	"geelooy/style/home-simple/base.css",
	"geelooy/style/home-simple/components.css",
	"geelooy/style/home-simple/home-polish-law8.css",
	"geelooy/css/golden-icons.css",
	"geelooy/css/awtsmoos-visual-assets.css",
];
const OUT = process.argv[2] || resolve(REPO, "geelooy/style/home-simple/home-bundle.css");

// Match an @import and its trailing newline so the inlined content's own
// ending newline does not create a spurious blank line.
const IMPORT_RE = /@import\s+url\(\s*["']([^"')]+)["']\s*\)\s*;\n?/g;

function stripQuery(p) {
	const q = p.indexOf("?");
	return q === -1 ? p : p.slice(0, q);
}

// String-aware /* */ comment stripper. Respects single, double, and
// backtick strings plus backslash escapes, so a /* inside a string value
// (content, url) is never treated as a comment start.
function stripComments(css) {
	let out = "";
	let i = 0;
	let state = "code";
	let quote = "";
	while (i < css.length) {
		const c = css[i];
		const n = css[i + 1];
		if (state === "code") {
			if (c === "/" && n === "*") { state = "comment"; i += 2; continue; }
			if (c === '"' || c === "'" || c === "`") { state = "str"; quote = c; out += c; i++; continue; }
			out += c; i++;
		} else if (state === "str") {
			out += c;
			if (c === "\\") { out += css[i + 1] || ""; i += 2; continue; }
			if (c === quote) state = "code";
			i++;
		} else {
			if (c === "*" && n === "/") { state = "code"; i += 2; continue; }
			i++;
		}
	}
	return out;
}

function ensureBlankLine(out) {
	// Two blank lines precede every inlined marker in the original bundle.
	if (out.endsWith("\n\n\n")) return out;
	if (out.endsWith("\n\n")) return out + "\n";
	if (out.endsWith("\n")) return out + "\n\n";
	return out + "\n\n\n";
}

const seen = new Set();

function flattenFile(absPath, stack) {
	const raw = stripComments(readFileSync(absPath, "utf8"));
	const dir = dirname(absPath);
	let out = "";
	let last = 0;
	let m;
	IMPORT_RE.lastIndex = 0;
	while ((m = IMPORT_RE.exec(raw)) !== null) {
		out += raw.slice(last, m.index);
		const written = stripQuery(m[1]);
		const target = resolve(dir, written);
		if (seen.has(target)) {
			// Duplicate: drop the import; the surrounding newlines leave a blank line.
		} else if (stack.includes(target)) {
			out = ensureBlankLine(out);
			out += `/* === inlined (circular, skipped): ${written} === */\n`;
		} else {
			seen.add(target);
			out = ensureBlankLine(out);
			out += `/* === inlined: ${written} === */\n`;
			out += flattenFile(target, [...stack, target]);
		}
		last = m.index + m[0].length;
	}
	out += raw.slice(last);
	return out;
}

const header = `\n/* B"H — Flattened homepage CSS bundle (1s guarantee). No @imports, no render-blocking requests. */\n\n`;
let bundle = header;
let first = true;
for (const top of TOP) {
	const abs = resolve(REPO, top);
	const rel = top.split(sep).join("/");
	seen.add(abs);
	if (!first) bundle += "\n\n";
	bundle += `/* ===== ${rel} ===== */\n`;
	bundle += flattenFile(abs, [abs]);
	first = false;
}
writeFileSync(OUT, bundle);
console.log(`wrote ${OUT} (${bundle.split("\n").length} lines, ${seen.size} unique files)`);
