//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ShapeAuditRules
 * @description
 * Tree walkers for the shape audit (see shapeAudit.js for WHY).
 *
 *   RULE A (known-bad): children of
 *     aliases/<a>/postsSubmitted/inHeichel/<h>/inSeries/<s>/
 *     are per-post backlink records and MUST be files. A directory
 *     there is the exact shape lie that flapped the site.
 *   RULE B (info): children of heichelos/<h>/posts/ are counted
 *     file-vs-dir; the native store historically mixes both.
 *
 * All walkers share one ctx: { visited, bad, counts } so the
 * global entry cap holds across every tree.
 */

const fs = require('fs');
const path = require('path');

/** @constant {number} Max mismatch lines kept for the report. */
const MAX_REPORT_LINES = 500;

/**
 * Yield to the event loop (the audit must never starve anything).
 * @returns {Promise<void>}
 */
function tick() { return new Promise((r) => setImmediate(r)); }

/**
 * readdir that never throws.
 * @param {string} dir
 * @returns {Promise<import('fs').Dirent[]>}
 */
async function listDir(dir) {
	try { return await fs.promises.readdir(dir, { withFileTypes: true }); }
	catch (_) { return []; }
}

/**
 * Audits RULE A under one alias dir.
 * @param {string} aliasDir aliases/<alias>
 * @param {{visited:number, bad:string[], maxEntries:number}} ctx
 * @returns {Promise<void>}
 */
async function auditAlias(aliasDir, ctx) {
	const seriesRoot = path.join(aliasDir, 'postsSubmitted', 'inHeichel');
	for (const h of await listDir(seriesRoot)) {
		if (!h.isDirectory() || ctx.visited > ctx.maxEntries) continue;
		const inSeries = path.join(seriesRoot, h.name, 'inSeries');
		for (const s of await listDir(inSeries)) {
			if (!s.isDirectory()) continue;
			for (const child of await listDir(path.join(inSeries, s.name))) {
				if (++ctx.visited > ctx.maxEntries) return;
				if (child.isDirectory() && ctx.bad.length < MAX_REPORT_LINES) {
					ctx.bad.push(path.join(inSeries, s.name, child.name));
				}
			}
			await tick();
		}
	}
}

/**
 * Audits RULE B under one heichel dir (file-vs-dir counts).
 * @param {string} heichelDir heichelos/<heichel>
 * @param {{visited:number, counts:{files:number, dirs:number},
 *   maxEntries:number}} ctx
 * @returns {Promise<void>}
 */
async function auditHeichelPosts(heichelDir, ctx) {
	for (const child of await listDir(path.join(heichelDir, 'posts'))) {
		if (++ctx.visited > ctx.maxEntries) return;
		if (child.isDirectory()) ctx.counts.dirs++;
		else ctx.counts.files++;
	}
}

module.exports = { tick, listDir, auditAlias, auditHeichelPosts };
