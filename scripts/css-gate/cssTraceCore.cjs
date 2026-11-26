// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file cssTraceCore.cjs — shared engine for the Awtsmoos CSS conflict tracer.
 * @description
 * The Awtsmoos names every garment by its maker; this engine parses stylesheets
 * (supplied virtually as {name, content} pairs, or fetched from a public page),
 * computes the cascade winner for every (media-context, selector, property),
 * and traces each conflict to its file: winner, losers, shadowed declarations,
 * and files that contribute zero winning declarations (EXTRA candidates).
 * It also reports elements that are NOT properly styled, in two legs:
 *  - static leg: classes/ids used in supplied HTML/templates that no loaded
 *    stylesheet defines a rule for (unstyled suspects);
 *  - live leg: a classifier over computed-style element dumps collected from a
 *    real browser (default styling, contrast failures, unstyled interactive
 *    elements, zero-size elements with content).
 * Pure Node, dependency-free, in-memory only: nothing is written to disk.
 */

const dns = require("node:dns/promises");
const net = require("node:net");

const CAPS = Object.freeze({
	maxFiles: 32,
	maxFileBytes: 256 * 1024,
	maxTotalBytes: 1024 * 1024,
	maxHtmlDocs: 8,
	maxHtmlBytes: 256 * 1024,
	maxUrlFiles: 64,
	maxUrlFileBytes: 512 * 1024,
	maxUrlTotalBytes: 2 * 1024 * 1024,
	maxPageBytes: 1024 * 1024,
	maxConflicts: 100,
	maxSuspects: 200,
	maxFindings: 200
});

// ---------- CSS parsing (ported from scripts/css-gate/css-conflict-trace.mjs) ----------
function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ""); }

function splitSelectors(sel) {
	const out = []; let depth = 0, cur = "";
	for (const ch of sel) {
		if (ch === "(" || ch === "[") depth++;
		if (ch === ")" || ch === "]") depth--;
		if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
	}
	if (cur.trim()) out.push(cur.trim());
	return out;
}

function specificity(sel) {
	let a = 0, b = 0, c = 0; let s = sel;
	s = s.replace(/\[[^\]]*\]/g, () => { b++; return " "; });
	s = s.replace(/#[\w-]+/g, () => { a++; return " "; });
	s = s.replace(/::[\w-]+(\([^)]*\))?/g, () => { c++; return " "; });
	s = s.replace(/:(not|is|matches|has)\(([^)]*)\)/g, (m, f, inner) => {
		const innerSpec = specificity(inner); a += innerSpec[0]; b += innerSpec[1]; c += innerSpec[2]; return " ";
	});
	s = s.replace(/:[\w-]+(\([^)]*\))?/g, () => { b++; return " "; });
	s = s.replace(/\.[\w-]+/g, () => { b++; return " "; });
	s = s.replace(/[>+~*]/g, " ");
	for (const tok of s.split(/\s+/)) if (/^[a-zA-Z][\w-]*$/.test(tok)) c++;
	return [a, b, c];
}
function cmpSpec(x, y) { for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; }

/** Class / id tokens a selector defines rules for (attribute contents ignored). */
function selectorTokens(sel) {
	const clean = sel.replace(/\[[^\]]*\]/g, " ").replace(/"[^"]*"|'[^']*'/g, " ");
	const classes = new Set(); const ids = new Set();
	for (const m of clean.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)) classes.add(m[1]);
	for (const m of clean.matchAll(/#([a-zA-Z_][\w-]*)/g)) ids.add(m[1]);
	return { classes, ids };
}

function parseCss(css, fileLabel, orderStart) {
	const decls = []; const rules = [];
	const definedClasses = new Set(); const definedIds = new Set();
	let order = orderStart;
	function parseBlock(text, context) {
		let i = 0; const n = text.length;
		while (i < n) {
			let pre = ""; let depth = 0;
			while (i < n) {
				const ch = text[i];
				if (ch === "(" || ch === "[") depth++;
				if (ch === ")" || ch === "]") depth--;
				if (depth === 0 && (ch === "{" || ch === ";")) break;
				pre += ch; i++;
			}
			pre = pre.trim();
			if (i >= n) break;
			if (text[i] === ";") { i++; continue; }
			let d = 1; let j = i + 1; let body = "";
			while (j < n && d > 0) { if (text[j] === "{") d++; else if (text[j] === "}") { d--; if (d === 0) break; } body += text[j]; j++; }
			i = j + 1;
			if (!pre) continue;
			if (/^@(media|supports|layer|document)/i.test(pre)) {
				parseBlock(body, context ? context + " | " + pre.replace(/\s+/g, " ") : pre.replace(/\s+/g, " "));
			} else if (/^@keyframes/i.test(pre) || /^@font-face/i.test(pre) || /^@page/i.test(pre)) {
				continue;
			} else if (pre.startsWith("@")) {
				parseBlock(body, context);
			} else {
				const sels = splitSelectors(pre.replace(/\s+/g, " "));
				const bodyDecls = [];
				for (const part of body.split(";")) {
					const ci = part.indexOf(":"); if (ci < 0) continue;
					const prop = part.slice(0, ci).trim().toLowerCase();
					let val = part.slice(ci + 1).trim().replace(/\s+/g, " ");
					if (!prop || !val) continue;
					let important = false;
					if (/!important\s*$/i.test(val)) { important = true; val = val.replace(/!important\s*$/i, "").trim(); }
					bodyDecls.push({ property: prop, value: val, important });
				}
				if (!bodyDecls.length) continue;
				for (const sel of sels) {
					const tokens = selectorTokens(sel);
					for (const c of tokens.classes) definedClasses.add(c);
					for (const id of tokens.ids) definedIds.add(id);
					rules.push({ file: fileLabel, selector: sel, context: context || "", declCount: bodyDecls.length, order });
					for (const bd of bodyDecls) decls.push({ file: fileLabel, selector: sel, context: context || "", ...bd, spec: specificity(sel), order });
					order++;
				}
			}
		}
	}
	parseBlock(stripComments(css), "");
	return { decls, rules, nextOrder: order, definedClasses, definedIds };
}

// ---------- conflict analysis ----------
function analyzeParsed(parsedFiles) {
	// parsedFiles: [{label, bytes, parsed}]
	let order = 0; const allDecls = []; const fileStats = new Map();
	const definedClasses = new Set(); const definedIds = new Set();
	for (const f of parsedFiles) {
		const { decls, rules, definedClasses: dc, definedIds: di } = f.parsed;
		for (const d of decls) allDecls.push(d);
		for (const c of dc) definedClasses.add(c);
		for (const id of di) definedIds.add(id);
		fileStats.set(f.label, { file: f.label, bytes: f.bytes, rules: rules.length, declarations: decls.length, wins: 0, losses: 0, shadowed: 0 });
	}
	const key = d => d.context + "\n" + d.selector + "\n" + d.property;
	const groups = new Map();
	for (const d of allDecls) { const k = key(d); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(d); }
	const conflicts = []; const shadowedDecls = [];
	for (const [, ds] of groups) {
		const filesInvolved = new Set(ds.map(d => d.file));
		if (ds.length === 1) { fileStats.get(ds[0].file).wins++; continue; }
		const sorted = [...ds].sort((x, y) => (y.important - x.important) || cmpSpec(y.spec, x.spec) || (y.order - x.order));
		const winner = sorted[0];
		fileStats.get(winner.file).wins++;
		const sameValue = ds.every(d => d.value === ds[0].value && d.important === ds[0].important);
		for (const d of sorted.slice(1)) {
			fileStats.get(d.file).losses++; fileStats.get(d.file).shadowed++; shadowedDecls.push(d);
		}
		if (filesInvolved.size > 1) {
			conflicts.push({
				context: ds[0].context || "(top level)", selector: ds[0].selector, property: ds[0].property,
				kind: sameValue ? "duplicate-same-value" : "conflict-different-values",
				winner: { file: winner.file, value: winner.value, important: winner.important },
				losers: sorted.slice(1).map(d => ({ file: d.file, value: d.value, important: d.important })),
				files: [...filesInvolved]
			});
		}
	}
	let exactDupRules = 0;
	{
		const perRule = new Map();
		for (const f of parsedFiles) {
			for (const r of f.parsed.rules) {
				const ds = allDecls.filter(d => d.file === r.file && d.selector === r.selector && d.context === r.context);
				const sig = r.context + "\n" + r.selector + "\n" + ds.map(d => d.property + ":" + d.value + (d.important ? "!" : "")).sort().join(";");
				if (!perRule.has(sig)) perRule.set(sig, new Set());
				perRule.get(sig).add(r.file);
			}
		}
		for (const [, fs] of perRule) if (fs.size > 1) exactDupRules++;
	}
	conflicts.sort((x, y) => (y.losers.length - x.losers.length) || y.files.length - x.files.length);
	const stats = [...fileStats.values()].sort((a, b) => b.bytes - a.bytes);
	const zeroWin = stats.filter(s => s.wins === 0);
	return {
		report: {
			files: stats,
			totalBytes: stats.reduce((s, f) => s + f.bytes, 0),
			totalDeclarations: allDecls.length,
			totalRules: stats.reduce((s, f) => s + f.rules, 0),
			conflicts: conflicts.slice(0, CAPS.maxConflicts),
			conflictsTruncated: conflicts.length > CAPS.maxConflicts,
			crossFileConflicts: conflicts.length,
			differentValueConflicts: conflicts.filter(c => c.kind === "conflict-different-values").length,
			sameValueDuplicates: conflicts.filter(c => c.kind === "duplicate-same-value").length,
			exactDuplicateRules: exactDupRules,
			shadowedDeclarations: shadowedDecls.length,
			zeroWinFiles: zeroWin.map(s => s.file)
		},
		definedClasses,
		definedIds
	};
}

// ---------- static unstyled leg ----------
/** Extract class/id usage from one HTML/template document. */
function extractUsedTokens(html) {
	const used = new Map(); // "class:name" -> {kind, name, tag, occurrences}
	const tagRe = /<([a-zA-Z][\w-]*)((?:\s[^<>]*?)?)\/?>/g;
	let m;
	while ((m = tagRe.exec(html))) {
		const tag = m[1].toLowerCase(); const attrs = m[2] || "";
		const classM = attrs.match(/\bclass\s*=\s*"([^"]*)"|\bclass\s*=\s*'([^']*)'/);
		if (classM) {
			for (const name of (classM[1] || classM[2] || "").split(/\s+/).filter(Boolean)) {
				const k = "class:" + name;
				const cur = used.get(k) || { kind: "class", name, tag, occurrences: 0 };
				cur.occurrences++; used.set(k, cur);
			}
		}
		const idM = attrs.match(/\bid\s*=\s*"([^"]*)"|\bid\s*=\s*'([^']*)'/);
		if (idM) {
			const name = idM[1] || idM[2];
			if (name && !/[{}]/.test(name)) {
				const k = "id:" + name;
				const cur = used.get(k) || { kind: "id", name, tag, occurrences: 0 };
				cur.occurrences++; used.set(k, cur);
			}
		}
	}
	return used;
}

/**
 * Classes/ids used in HTML that no analyzed stylesheet defines a rule for.
 * htmlDocs: [{name, html}]. Returns capped suspect list.
 */
function findUnstyledSuspects(htmlDocs, definedClasses, definedIds) {
	const suspects = [];
	for (const doc of htmlDocs || []) {
		for (const tok of extractUsedTokens(doc.html).values()) {
			const defined = tok.kind === "class" ? definedClasses.has(tok.name) : definedIds.has(tok.name);
			if (!defined) {
				suspects.push({
					page: doc.name, kind: tok.kind, name: tok.name,
					element: `<${tok.tag}>`, occurrences: tok.occurrences,
					defect: `used in HTML but no loaded stylesheet defines a rule for this ${tok.kind}`
				});
			}
		}
	}
	suspects.sort((a, b) => b.occurrences - a.occurrences);
	return { suspects: suspects.slice(0, CAPS.maxSuspects), totalSuspects: suspects.length, truncated: suspects.length > CAPS.maxSuspects };
}

// ---------- virtual input ----------
function validateVirtualFiles(files) {
	if (!Array.isArray(files) || !files.length) return { error: "files_required", details: "Supply files: [{name, content}] with at least one CSS file." };
	if (files.length > CAPS.maxFiles) return { error: "too_many_files", details: `At most ${CAPS.maxFiles} files per trace.` };
	let total = 0;
	const clean = [];
	for (const f of files) {
		const name = String(f?.name || "").slice(0, 200);
		const content = typeof f?.content === "string" ? f.content : null;
		if (!name || content === null) return { error: "invalid_file_entry", details: "Each file needs a name and string content." };
		const bytes = Buffer.byteLength(content);
		if (bytes > CAPS.maxFileBytes) return { error: "file_too_large", details: `${name} exceeds ${CAPS.maxFileBytes} bytes.` };
		total += bytes;
		if (total > CAPS.maxTotalBytes) return { error: "payload_too_large", details: `Total CSS exceeds ${CAPS.maxTotalBytes} bytes.` };
		clean.push({ label: name, bytes, css: content });
	}
	return { files: clean };
}

function validateHtmlDocs(html) {
	if (html === undefined || html === null) return { docs: [] };
	if (!Array.isArray(html)) return { error: "invalid_html", details: "html must be an array of {name, content}." };
	if (html.length > CAPS.maxHtmlDocs) return { error: "too_many_html_docs", details: `At most ${CAPS.maxHtmlDocs} HTML documents.` };
	const docs = [];
	for (const d of html) {
		const name = String(d?.name || "page").slice(0, 200);
		const content = typeof d?.content === "string" ? d.content : null;
		if (content === null) return { error: "invalid_html_entry", details: "Each html entry needs string content." };
		if (Buffer.byteLength(content) > CAPS.maxHtmlBytes) return { error: "html_too_large", details: `${name} exceeds ${CAPS.maxHtmlBytes} bytes.` };
		docs.push({ name, html: content });
	}
	return { docs };
}

/** Full virtual trace: CSS files in memory + optional HTML docs for the static unstyled leg. */
function traceVirtual({ files, htmlDocs = [], name = "virtual" } = {}) {
	let order = 0; const parsedFiles = [];
	for (const f of files) { const p = parseCss(f.css, f.label, order); order = p.nextOrder; parsedFiles.push({ label: f.label, bytes: f.bytes, parsed: p }); }
	const { report, definedClasses, definedIds } = analyzeParsed(parsedFiles);
	const unstyled = findUnstyledSuspects(htmlDocs, definedClasses, definedIds);
	return {
		ok: true, tool: "awtsmoos-css-trace", mode: "virtual",
		name,
		...report,
		unstyledElements: {
			leg: "static",
			note: "Classes/ids used in the supplied HTML that no supplied stylesheet defines. Suspects, not verdicts: a class may be styled by a sheet that was not supplied.",
			...unstyled
		}
	};
}

// ---------- SSRF guard ----------
function isPrivateIp(ip) {
	if (net.isIPv4(ip)) {
		const [a, b] = ip.split(".").map(Number);
		if (a === 0 || a === 10 || a === 127) return true;
		if (a === 169 && b === 254) return true;
		if (a === 172 && b >= 16 && b <= 31) return true;
		if (a === 192 && b === 168) return true;
		if (a === 192 && b === 0) return true;
		if (a === 198 && (b === 18 || b === 19)) return true;
		if (a >= 224) return true;
		return false;
	}
	if (net.isIPv6(ip)) {
		const low = ip.toLowerCase();
		if (low === "::1" || low === "::") return true;
		if (low.startsWith("fe8") || low.startsWith("fe9") || low.startsWith("fea") || low.startsWith("feb")) return true;
		if (low.startsWith("fc") || low.startsWith("fd")) return true;
		if (low.startsWith("ff")) return true;
		const mapped = low.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
		if (mapped) return isPrivateIp(mapped[1]);
		return false;
	}
	return true; // unparseable: fail closed
}

/** Validate that a URL is a public http(s) target. Throws {code} errors. */
async function assertPublicUrl(raw, lookup = dns.lookup) {
	let u;
	try { u = new URL(String(raw)); } catch { const e = new Error("invalid_url"); e.code = "invalid_url"; throw e; }
	if (u.protocol !== "http:" && u.protocol !== "https:") { const e = new Error("url_protocol"); e.code = "url_protocol"; throw e; }
	const host = u.hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
	if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
		const e = new Error("url_private"); e.code = "url_private"; throw e;
	}
	if (net.isIP(host)) {
		if (isPrivateIp(host)) { const e = new Error("url_private"); e.code = "url_private"; throw e; }
		return u;
	}
	let addrs;
	try { addrs = await lookup(host, { all: true, verbatim: true }); } catch { const e = new Error("url_unresolvable"); e.code = "url_unresolvable"; throw e; }
	if (!addrs?.length) { const e = new Error("url_unresolvable"); e.code = "url_unresolvable"; throw e; }
	for (const a of addrs) if (isPrivateIp(a.address)) { const e = new Error("url_private"); e.code = "url_private"; throw e; }
	return u;
}

/** Fetch with manual redirect re-validation and a byte cap. */
async function fetchCapped(rawUrl, maxBytes, fetchImpl = fetch) {
	let current = String(rawUrl);
	for (let hop = 0; hop <= 3; hop++) {
		const u = await assertPublicUrl(current);
		const res = await fetchImpl(u, { redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "user-agent": "AwtsmoosCssTrace/1.0" } });
		if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
			if (hop === 3) { const e = new Error("too_many_redirects"); e.code = "too_many_redirects"; throw e; }
			current = new URL(res.headers.get("location"), u).toString();
			continue;
		}
		if (!res.ok) { const e = new Error("fetch_failed_" + res.status); e.code = "fetch_failed"; e.status = res.status; throw e; }
		const reader = res.body.getReader();
		const chunks = []; let total = 0;
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > maxBytes) { try { await reader.cancel(); } catch {} const e = new Error("response_too_large"); e.code = "response_too_large"; throw e; }
			chunks.push(value);
		}
		return Buffer.concat(chunks).toString("utf8");
	}
	const e = new Error("too_many_redirects"); e.code = "too_many_redirects"; throw e;
}

/** Served-mode trace of a public page: real load order, bundle expansion, static unstyled leg on the page itself. */
async function traceUrl(rawUrl, fetchImpl = fetch) {
	const pageUrl = (await assertPublicUrl(rawUrl)).toString();
	const html = await fetchCapped(pageUrl, CAPS.maxPageBytes, fetchImpl);
	const base = new URL(pageUrl);
	const ordered = [];
	const linkRe = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi; let m;
	while ((m = linkRe.exec(html))) {
		const tag = m[0]; const hrefM = tag.match(/href=["']([^"']+)["']/); if (!hrefM) continue;
		const href = hrefM[1];
		const bundleM = href.match(/bundle=([^&"']+)/);
		if (bundleM) {
			try { const list = JSON.parse(decodeURIComponent(bundleM[1])); for (const u of list) ordered.push(u); continue; } catch {}
		}
		ordered.push(href);
	}
	const files = []; const seen = new Set(); let totalBytes = 0;
	for (const u of ordered) {
		if (files.length >= CAPS.maxUrlFiles) break;
		const abs = new URL(u, base).toString();
		if (seen.has(abs)) continue; seen.add(abs);
		const label = new URL(u, base).pathname;
		try {
			const css = await fetchCapped(abs, CAPS.maxUrlFileBytes, fetchImpl);
			const bytes = Buffer.byteLength(css);
			totalBytes += bytes;
			if (totalBytes > CAPS.maxUrlTotalBytes) break;
			files.push({ label, bytes, css });
		} catch (e) {
			files.push({ label: label + " (FETCH FAILED: " + (e.code || e.message) + ")", bytes: 0, css: "" });
		}
	}
	const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi; let k = 0;
	while ((m = styleRe.exec(html))) { const css = m[1]; if (css.trim().length > 20) files.push({ label: "<inline style #" + (++k) + " on page>", bytes: Buffer.byteLength(css), css }); }
	let order = 0; const parsedFiles = [];
	for (const f of files) { const p = parseCss(f.css, f.label, order); order = p.nextOrder; parsedFiles.push({ label: f.label, bytes: f.bytes, parsed: p }); }
	const { report, definedClasses, definedIds } = analyzeParsed(parsedFiles);
	const unstyled = findUnstyledSuspects([{ name: pageUrl, html }], definedClasses, definedIds);
	return {
		ok: true, tool: "awtsmoos-css-trace", mode: "served",
		name: pageUrl, source: pageUrl,
		...report,
		unstyledElements: {
			leg: "static",
			note: "Classes/ids used in the page HTML that none of the stylesheets it loads define a rule for. Suspects, not verdicts: runtime-injected markup is not in the served HTML.",
			...unstyled
		}
	};
}

// ---------- live leg: computed-style classifier ----------
function parseRgb(text) {
	const m = String(text || "").match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/);
	if (!m) return null;
	return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] === undefined ? 1 : Number(m[4]) };
}
function luminance({ r, g, b }) {
	const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(c1, c2) {
	const l1 = luminance(c1), l2 = luminance(c2);
	const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
	return (hi + 0.05) / (lo + 0.05);
}

/**
 * Classify computed-style element dumps collected from a real browser.
 * Element: {tag, id, classes[], text, color, background, authorStyled,
 *           interactive, width, height}
 * Returns findings: page, element descriptor, defect, candidate files.
 */
function analyzeComputedElements(elements, { page = "", candidateFiles = [] } = {}) {
	const findings = [];
	for (const el of elements || []) {
		const descriptor = String(el.tag || "?").toLowerCase() +
			(el.id ? "#" + el.id : "") +
			(el.classes?.length ? "." + el.classes.slice(0, 3).join(".") : "");
		const snippet = String(el.text || "").trim().slice(0, 60);
		const base = { page, element: descriptor, text: snippet, candidates: candidateFiles };
		if (el.interactive && !el.authorStyled) {
			findings.push({ ...base, defect: "interactive-unstyled", detail: "Interactive element has no author styling; it renders with pure browser-default styling." });
		} else if (!el.authorStyled && snippet) {
			findings.push({ ...base, defect: "default-styled", detail: "No author rule wins anything on this element; it renders with pure browser-default styling." });
		}
		if (snippet && (el.width < 1 || el.height < 1)) {
			findings.push({ ...base, defect: "zero-size-content", detail: `Element has text content but renders at ${el.width || 0}x${el.height || 0}px.` });
		}
		if (snippet) {
			const fg = parseRgb(el.color); const bg = parseRgb(el.background);
			if (fg && bg && bg.a > 0) {
				const ratio = contrastRatio(fg, bg);
				if (ratio < 4.5) {
					findings.push({ ...base, defect: "low-contrast", detail: `Text contrast ${ratio.toFixed(2)}:1 (color ${el.color} on background ${el.background}) is below the 4.5:1 floor.`, ratio: Number(ratio.toFixed(2)) });
				}
			}
		}
		if (findings.length >= CAPS.maxFindings) break;
	}
	return { leg: "live", page, findings, totalFindings: findings.length, truncated: findings.length >= CAPS.maxFindings };
}

module.exports = {
	CAPS,
	parseCss,
	analyzeParsed,
	extractUsedTokens,
	findUnstyledSuspects,
	validateVirtualFiles,
	validateHtmlDocs,
	traceVirtual,
	isPrivateIp,
	assertPublicUrl,
	fetchCapped,
	traceUrl,
	parseRgb,
	contrastRatio,
	analyzeComputedElements
};
