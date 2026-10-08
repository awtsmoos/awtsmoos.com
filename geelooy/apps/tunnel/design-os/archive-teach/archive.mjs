//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file The Design Archive.
 * @description Every design decision, preserved. Each design() call is logged:
 * input constraints, solved values, timestamp, who approved, and why.
 * Stored as JSONL (one record per line) so it is queryable forever.
 *
 * A design decision is like a psak: the question, the sources consulted,
 * the conclusion, and who signed it. The archive is the responsa literature
 * of the Design OS.
 */

import { mkdirSync, appendFileSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

const DEFAULT_DIR = join(homedir(), ".awtsmoos-design-archive");
const DEFAULT_FILE = join(DEFAULT_DIR, "design-decisions.jsonl");

let archiveFile = process.env.AWTSMOOS_DESIGN_ARCHIVE || DEFAULT_FILE;

/** Override the archive location (tests, alternate stores). */
export function setArchivePath(path) {
	archiveFile = path;
}

/** Current archive location. */
export function archivePath() {
	return archiveFile;
}

function ensureDir() {
	mkdirSync(dirname(archiveFile), { recursive: true });
}

function makeId() {
	return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Log a design decision.
 * @param {Object} opts
 * @param {string} opts.src Constraint DSL source (the question asked).
 * @param {Array<string>} [opts.bundles] Library bundles included.
 * @param {Object} [opts.inputs] Pre-seeded input values.
 * @param {Object} opts.result The design() result ({ok, values, errors}).
 * @param {string} [opts.approvedBy] Who approved ("yaakov", "auto", "pending").
 * @param {string} [opts.note] Human note about why this design was chosen.
 * @param {string} [opts.tag] Release tag or category label.
 * @returns {Object} The archived record (including id and timestamp).
 */
export function logDesign({ src, bundles = [], inputs = {}, result, approvedBy = "pending", note = "", tag = "" }) {
	ensureDir();
	const record = {
		id: makeId(),
		timestamp: new Date().toISOString(),
		src,
		bundles,
		inputs,
		ok: result.ok,
		values: result.values || {},
		errors: result.errors || [],
		approvedBy,
		note,
		tag,
	};
	appendFileSync(archiveFile, JSON.stringify(record) + "\n", "utf8");
	return record;
}

/** Mark a record approved (or re-approved) by someone. */
export function approve(id, by) {
	ensureDir();
	const records = readAll();
	const rec = records.find((r) => r.id === id);
	if (!rec) throw new Error(`No archived design with id ${id}`);
	rec.approvedBy = by;
	rec.approvedAt = new Date().toISOString();
	writeAll(records);
	return rec;
}

/** Read every record in the archive. */
export function readAll() {
	if (!existsSync(archiveFile)) return [];
	return readFileSync(archiveFile, "utf8")
		.split("\n")
		.filter((l) => l.trim())
		.map((l) => JSON.parse(l));
}

function writeAll(records) {
	ensureDir();
	writeFileSync(archiveFile, records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
}

/**
 * Query the archive.
 * @param {Object} q Filters: since, until (ISO), contains (substring of src),
 *   tag, approvedBy, okOnly, limit.
 */
export function query(q = {}) {
	let records = readAll();
	if (q.since) records = records.filter((r) => r.timestamp >= q.since);
	if (q.until) records = records.filter((r) => r.timestamp <= q.until);
	if (q.contains) records = records.filter((r) => (r.src || "").includes(q.contains));
	if (q.tag) records = records.filter((r) => r.tag === q.tag);
	if (q.approvedBy) records = records.filter((r) => r.approvedBy === q.approvedBy);
	if (q.okOnly) records = records.filter((r) => r.ok);
	records.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
	if (q.limit) records = records.slice(0, q.limit);
	return records;
}

/** High-level summary of the archive. */
export function summarize() {
	const records = readAll();
	const ok = records.filter((r) => r.ok).length;
	const tags = {};
	const approvers = {};
	for (const r of records) {
		if (r.tag) tags[r.tag] = (tags[r.tag] || 0) + 1;
		approvers[r.approvedBy || "pending"] = (approvers[r.approvedBy || "pending"] || 0) + 1;
	}
	return {
		total: records.length,
		successful: ok,
		failed: records.length - ok,
		oldest: records.length ? records[records.length - 1].timestamp : null,
		newest: records.length ? records[0].timestamp : null,
		tags,
		approvers,
	};
}

/** Export the archive as readable Markdown (a "sefer" of decisions). */
export function exportMarkdown(q = {}) {
	const records = query(q);
	const lines = ["# Sefer of Design Decisions", "", `_Exported ${new Date().toISOString()}_`, ""];
	for (const r of records) {
		lines.push(`## ${r.timestamp} · ${r.id}`);
		if (r.tag) lines.push(`_Tag: ${r.tag}_`);
		lines.push(`_Approved by: ${r.approvedBy || "pending"}_`);
		if (r.note) lines.push(`> ${r.note}`);
		lines.push("");
		lines.push("```");
		lines.push(r.src);
		lines.push("```");
		if (r.ok) {
			lines.push("**Solved:**");
			for (const [k, v] of Object.entries(r.values)) lines.push(`- \`${k}\` = ${v}`);
		} else {
			lines.push("**Failed:**");
			for (const e of r.errors) lines.push(`- ${e}`);
		}
		lines.push("", "---", "");
	}
	return lines.join("\n");
}
