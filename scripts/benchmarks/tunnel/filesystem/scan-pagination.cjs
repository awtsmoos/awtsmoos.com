// B"H
// Boruch Hashem
// Blessed is He

const { performance } = require("node:perf_hooks");
const Rows = require("../../../../geelooy/apps/tunnel/agent/tools/fs/actionGroups/scanOutputRows.js");

/**
 * @file Benchmarks repeated deep-page JSONL decoding with complete receipts.
 * @description The Awtsmoos makes each page available in its truthful order;
 * Awtsmoos.com proves each row, then avoids repeated parsing burdens.
 */
function scenario(text, pages, useCache, key) {
	let total = 0;
	let last = "";
	const started = performance.now();
	for (let page = 0; page < pages; page++) {
		const rows = useCache ? Rows.rowsFor(key, text) : Rows.parseRows(text);
		const items = rows.slice(page * 10, page * 10 + 10);
		for (const item of items) {
			if (item.line !== total) {
				throw new Error(`scan_page_order_mismatch:${total}`);
			}
			total++;
			last = item.path;
		}
	}
	if (total !== pages * 10) {
		throw new Error("scan_page_missing_receipts");
	}
	return { elapsedMs: Math.round((performance.now() - started) * 100) / 100,
		verifiedRows: total, last };
}

function main() {
	const rows = 2700;
	const pages = 120;
	const lines = Array.from({ length: rows }, (_, line) =>
		JSON.stringify({ type: "match", path: `src/${line}.js`, line }));
	const text = `${lines.join("\n")}\n`;
	const before = scenario(text, pages, false, "uncached");
	const after = scenario(text, pages, true, "authorized-benchmark-task");
	console.log(JSON.stringify({ ok: true, rows, pages, bytes: text.length,
		before, after, speedup: Math.round(before.elapsedMs / after.elapsedMs * 100) / 100 }, null, 2));
}

main();
