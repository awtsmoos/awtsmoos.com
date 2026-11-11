// B"H
// Folds the tunnel-control stylesheet closure into ONE bundle in exact
// cascade order: css/app.css is expanded depth-first, each @import inlined
// where it stands, and layered imports are re-emitted as @layer blocks so
// cascade-layer precedence (awt.tokens < awt.reset < ... ) is preserved
// exactly - nesting mirrors the original import tree. The app's pages link
// bundle.css instead of walking an 88-file @import chain (88 sequential
// requests before the styles settle).
// Re-run after any stylesheet change: node build-bundle.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const CSS_DIR = dirname(fileURLToPath(import.meta.url));
const ENTRY = "app.css";
const IMPORT_RE = /^(\s*)@import\s+(?:url\(\s*)?["']([^"')]+)["']\s*\)?\s*(?:layer\(\s*([a-zA-Z0-9_.-]+)\s*\))?\s*;?\s*$/;

const seen = new Set();
const order = [];
function expand(relPath) {
	const abs = join(CSS_DIR, relPath);
	const source = readFileSync(abs, "utf8");
	const out = [];
	for (const line of source.split("\n")) {
		const m = line.match(IMPORT_RE);
		if (m) {
			const target = join(dirname(relPath), m[2]).split("\\").join("/");
			if (seen.has(target)) continue;
			seen.add(target);
			order.push(target);
			const inner = expand(target);
			out.push(`/* ==== ${target} ==== */`);
			out.push(m[3] ? `@layer ${m[3]} {\n${inner}\n}` : inner);
		} else if (line.includes("@import")) {
			throw new Error(`unhandled @import shape in ${relPath}: ${line.trim()}`);
		} else {
			out.push(line);
		}
	}
	return out.join("\n");
}

seen.add(ENTRY);
const body = expand(ENTRY);
const bundle = `/* B"H - tunnel-control stylesheet bundle: ${order.length + 1} files folded in cascade order by css/build-bundle.mjs. Do not edit; edit the sources and re-run the builder. */\n${body}\n`;
const outPath = join(CSS_DIR, "bundle.css");
writeFileSync(outPath, bundle);
const sha = createHash("sha256").update(bundle).digest("hex");
console.log(JSON.stringify({ files: order.length + 1, bytes: Buffer.byteLength(bundle), sha256: sha, pin: sha.slice(0, 10) }, null, 2));
