// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { test } = require("node:test");
const Pager = require("../tools/fs/actionGroups/scanOutputPager.js");

/**
 * @file Proves deep search output integrity, cache and fail-closed custody.
 * @description The Awtsmoos remembers every leaf without dropping the last;
 * Awtsmoos.com demands an authorized witness when another page is asked.
 */
function source(text, taskId = "scan-test", revision = "v1") {
	let reads = 0;
	return {
		get reads() { return reads; },
		output: payload => {
			reads++;
			return { ok: true, taskId, offsetChars: payload.offsetChars,
				totalChars: text.length, progressSequence: revision,
				content: text.slice(payload.offsetChars, payload.offsetChars + payload.maxChars) };
		}
	};
}

function data(count) {
	return Array.from({ length: count }, (_, index) =>
		JSON.stringify({ type: "match", path: `src/${index}.js`, line: index })).join("\n") + "\n";
}

test("reads all search rows beyond the former 200000 character horizon", () => {
	const text = data(12000);
	assert.ok(text.length > 200000);
	const mock = source(text, "deep-12k");
	const result = Pager.readRows({ taskId: "deep-12k" }, mock.output);
	assert.equal(result.ok, true);
	assert.equal(result.rows.length, 12000);
	assert.equal(result.rows[11999].line, 11999);
	assert.ok(mock.reads > 4);
});

test("reuses unchanged rows after rechecking owned task output", () => {
	const mock = source(data(40), "cache-40");
	const first = Pager.readRows({ taskId: "cache-40" }, mock.output);
	const count = mock.reads;
	const second = Pager.readRows({ taskId: "cache-40" }, mock.output);
	assert.strictEqual(first.rows, second.rows);
	assert.equal(second.cached, true);
	assert.equal(mock.reads, count + 1);
});

test("rejects inaccessible and mismatched task IDs even if rows were cached", () => {
	const mock = source(data(5), "secure-task");
	assert.equal(Pager.readRows({ taskId: "secure-task" }, mock.output).ok, true);
	assert.equal(Pager.readRows({ taskId: "other-task" }, mock.output).error,
		"scan_task_not_accessible");
	assert.equal(Pager.readRows({ taskId: "secure-task" }, () => ({ ok: false })).ok, false);
});

test("reports oversized output instead of falsely claiming a final page", () => {
	const mock = source("z".repeat(2 * 1024 * 1024 + 1), "overflow");
	const result = Pager.readRows({ taskId: "overflow" }, mock.output);
	assert.equal(result.error, "scan_output_exceeds_safe_limit");
	assert.equal(result.ok, false);
	assert.equal(mock.reads, 1);
});

test("fails safely when stdout grows between chunk reads", () => {
	let text = data(5000);
	const mock = source(text, "growing");
	let count = 0;
	const output = payload => {
		const result = mock.output(payload);
		count++;
		if (count > 2) result.totalChars += 1;
		return result;
	};
	const result = Pager.readRows({ taskId: "growing" }, output);
	assert.equal(result.error, "scan_output_changed_during_read");
});

test("rejects stalled chunk reads, never looping forever", () => {
	const text = data(150);
	const mock = source(text, "empty-chunk");
	const result = Pager.readRows({ taskId: "empty-chunk" }, payload => {
		const response = mock.output(payload);
		if (payload.maxChars > 1) response.content = "";
		return response;
	});
	assert.equal(result.error, "scan_output_incomplete_chunk");
});

test("retains malformed-line skipping and summary beyond the old cutoff", () => {
	const text = `${data(6000)}not-valid-json\n${JSON.stringify({ type: "summary", matches: 6000 })}\n`;
	const mock = source(text, "long-summary");
	const result = Pager.readRows({ taskId: "long-summary" }, mock.output);
	assert.equal(result.ok, true);
	assert.equal(result.rows.length, 6001);
	assert.equal(result.rows[6000].matches, 6000);
});

test("empty output and missing task identity have honest receipts", () => {
	const mock = source("", "empty-identity");
	assert.deepEqual(Pager.readRows({ taskId: "empty-identity" }, mock.output).rows, []);
	assert.equal(Pager.readRows({}, mock.output).error, "scan_task_required");
	assert.equal(Pager.readRows({ taskId: "empty-identity" }).ok, false);
});
