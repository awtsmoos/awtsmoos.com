// B"H
// build-bundle.mjs — reader post page CSS bundler (site QA, 2026-11-10).
//
// The post page linked 25 stylesheets whose @import closure is 94 files /
// ~417KB — 94 render-blocking requests and a cascade nobody can hold in
// their head (the floating-controls dock alone is fought over by half a
// dozen "authority"/"rescue"/"stability" sheets). This builder folds the
// closure into ONE file in exact cascade order, following browser @import
// semantics: only @imports that lead their file (before any rule) are
// honored — a later @import is one browsers drop, so the builder drops it
// too and says so. The two meluket sefer sheets stay as separate links:
// MeluketSeferReader.js owns those link elements and swaps their hrefs.
//
// Usage: node build-bundle.mjs   (run from geelooy/heichelos/post/styles)
// Output: post-bundle.css next to this script. The template pins it by
// content hash, so nginx serves it immutable.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const stylesDir = dirname(fileURLToPath(import.meta.url));
const postDir = resolve(stylesDir, '..');
const geelooyDir = resolve(postDir, '..', '..');
const templatePath = join(postDir, '_awtsmoos.post.html');
const outPath = join(stylesDir, 'post-bundle.css');
const SKIP_IDS = new Set(['awtsmoos-sefer-style-sefer', 'awtsmoos-sefer-style-law8']);

// The template's original 23 links, frozen: since the bundle landed, the
// template itself links only post-bundle.css (+ the two meluket sheets), so
// the builder can no longer discover this list from the template. Order IS
// the cascade — do not reorder. The meluket sheets are excluded on purpose
// (MeluketSeferReader.js owns those links).
const links = [
	'/heichelos/post/styles/reader-inline-extracted.css',
	'/heichelos/post/styles/translations.css',
	'/heichelos/post/rashi/rashi.css',
	'/heichelos/post/comments/panel/commentaryMenu.css',
	'/style/awtsmoos-scroll-sovereignty.css',
	'/heichelos/post/styles/reader-controls/critical-shell.css',
	'/heichelos/post/styles/reader-controls/live-template.css',
	'/heichelos/post/styles/reader-controls/mobile-reading.css',
	'/heichelos/post/styles/reader-controls/torah-authority.css',
	'/heichelos/post/styles/reader-controls/reader-recovery.css',
	'/heichelos/post/styles/law8/law8-post-reader.css',
	'/heichelos/post/styles/reader-padding-fix.css',
	'/heichelos/post/styles/scroll-stability.css',
	'/heichelos/post/styles/passive-reader.css',
	'/heichelos/post/styles/reader-content/mobile-layout-stability.css',
	'/heichelos/post/styles/reader-content/reader-visual-stability.css',
	'/heichelos/post/styles/reader-content/reader-containment-fix.css',
	'/heichelos/post/styles/reader-content/reader-mobile-rescue.css',
	'/heichelos/post/styles/reader-content/reader-pair-selection.css',
	'/heichelos/post/styles/reader-content/reader-info-navigation.css',
	'/heichelos/post/styles/reader-content/reader-info-submenus.css',
	'/heichelos/post/styles/reader-content/reader-settings-coherence.css',
	'/heichelos/post/styles/ideal/reborn/comments.css'
];

const warnings = [];
const seen = new Set();
const parts = [];

function stripCommentsState(line, state) {
	// returns the line with comment spans blanked, tracking /* */ across lines
	let out = '';
	for (let i = 0; i < line.length; i++) {
		if (state.inComment) {
			if (line[i] === '*' && line[i + 1] === '/') { state.inComment = false; i++; out += '  '; } else out += ' ';
		} else if (line[i] === '/' && line[i + 1] === '*') {
			state.inComment = true; i++; out += '  ';
		} else out += line[i];
	}
	return out;
}

function expand(absPath) {
	const rel = relative(geelooyDir, absPath);
	if (seen.has(absPath)) { warnings.push(`duplicate skipped (already in cascade): ${rel}`); return; }
	seen.add(absPath);
	if (!existsSync(absPath)) { warnings.push(`MISSING @import target (browser 404s it, contributes nothing): ${rel}`); return; }
	const text = readFileSync(absPath, 'utf8');
	const state = { inComment: false };
	let leading = true; // still in the @charset/@import head of the file
	const body = [];
	for (const line of text.split('\n')) {
		const code = stripCommentsState(line, state);
		const imp = /^\s*@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?\s*;?\s*$/.exec(code);
		if (imp && !state.inComment) {
			const target = imp[1].split('?')[0];
			if (/^https?:/.test(target)) { warnings.push(`external @import kept as-is (INVALID mid-bundle, must fix): ${rel} -> ${target}`); body.push(line); leading = false; continue; }
			if (!leading) { warnings.push(`late @import dropped (browsers drop it too): ${rel} -> ${target}`); continue; }
			const targetAbs = target.startsWith('/')
				? join(geelooyDir, target)
				: resolve(dirname(absPath), target);
			expand(targetAbs);
			continue;
		}
		if (/^\s*@charset\b/.test(code)) continue; // the bundle carries one @charset at its head
		if (code.trim() && !/^\s*@/.test(code)) leading = false;
		body.push(line);
	}
	parts.push(`\n/* ==== ${rel} ==== */\n` + body.join('\n'));
}

for (const href of links) expand(join(geelooyDir, href.replace(/^\//, '')));

const banner = `@charset "UTF-8";\n/* B"H — GENERATED by heichelos/post/styles/build-bundle.mjs. Do not edit by hand.\n * One bundle for the reader post page, folded from ${seen.size} source sheets in exact\n * cascade order. Sources stay on disk; edit them and re-run the builder. */\n`;
writeFileSync(outPath, banner + parts.join('\n'));
console.log(`wrote ${relative(geelooyDir, outPath)} from ${seen.size} files, ${links.length} template links`);
for (const w of warnings) console.log('WARN:', w);
