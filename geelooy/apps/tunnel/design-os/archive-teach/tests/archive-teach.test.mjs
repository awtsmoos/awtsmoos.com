//B"H
// Tests for the Design Archive + Teaching System.

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rmSync } from "node:fs";

import {
	designAndLog,
	logDesign,
	approve,
	readAll,
	query,
	summarize,
	exportMarkdown,
	setArchivePath,
	explain,
	whyValue,
	exprToWords,
	teach,
	answerQuestion,
	lessonMarkdown,
	verdict,
} from "../index.mjs";

const SRC = `body.fontSize = 16px
title.fontSize = 4 * body.fontSize
title.color = #2b2118
title.background = #fffdf6
contrast(title.color, title.background) >= 7.0`;

describe("archive", () => {
	let file;
	beforeEach(() => {
		file = join(tmpdir(), `design-archive-test-${Date.now()}-${Math.random().toString(36).slice(2)}.jsonl`);
		setArchivePath(file);
	});

	it("logs a design decision with id and timestamp", () => {
		const { result, record } = designAndLog(SRC, { note: "test", tag: "t1", approvedBy: "yaakov" });
		assert.ok(result.ok, "design should solve");
		assert.ok(record.id, "record has id");
		assert.ok(record.timestamp, "record has timestamp");
		assert.equal(record.values["title.fontSize"], "64px");
		assert.equal(record.tag, "t1");
		const all = readAll();
		assert.equal(all.length, 1);
		assert.equal(all[0].id, record.id);
	});

	it("queries by tag, contains, okOnly, limit", () => {
		designAndLog(SRC, { tag: "a" });
		designAndLog("body.fontSize = 16px", { tag: "b" });
		designAndLog("title.fontSize = ==", { tag: "a" }); // parse error -> not ok
		assert.equal(query({ tag: "a" }).length, 2);
		assert.equal(query({ okOnly: true }).length, 2);
		assert.equal(query({ contains: "fontSize" }).length, 3);
		assert.equal(query({ limit: 1 }).length, 1);
	});

	it("approves a record", () => {
		const { record } = designAndLog(SRC, {});
		const rec = approve(record.id, "yaakov");
		assert.equal(rec.approvedBy, "yaakov");
		assert.ok(rec.approvedAt);
		assert.equal(query({ approvedBy: "yaakov" }).length, 1);
	});

	it("summarizes and exports markdown", () => {
		designAndLog(SRC, { tag: "x", note: "hello" });
		const s = summarize();
		assert.equal(s.total, 1);
		assert.equal(s.successful, 1);
		assert.equal(s.tags.x, 1);
		const md = exportMarkdown({});
		assert.ok(md.includes("# Sefer of Design Decisions"));
		assert.ok(md.includes("64px"));
		assert.ok(md.includes("hello"));
	});
});

describe("explainer", () => {
	it("explains each decision in plain language", () => {
		const e = explain(SRC);
		assert.ok(e.ok, JSON.stringify(e.errors));
		assert.ok(e.headline.includes("4 decisions"));
		const title = e.explanations.find((x) => x.path === "title.fontSize");
		assert.ok(title, "title.fontSize explained");
		assert.ok(title.text.includes("64px"), "mentions solved value");
		assert.ok(title.text.includes("4"), "mentions the multiplier");
		assert.ok(title.text.includes("16px"), "mentions the body size");
	});

	it("reports contrast required vs achieved", () => {
		const e = explain(SRC);
		const c = e.explanations.find((x) => x.rule.includes("contrast"));
		assert.ok(c, "contrast rule explained");
		assert.ok(c.text.includes("at least 7"), "mentions requirement");
		assert.ok(/achieves 1\d\.\d\d/.test(c.text), "mentions achieved ratio: " + c.text);
		assert.ok(c.text.includes("readable"), "says why it matters");
	});

	it("answers why a specific value", () => {
		const a = whyValue(SRC, "title.fontSize");
		assert.ok(a.includes("64px"));
		assert.ok(!a.includes("Parse error"));
	});

	it("says so when a path is undecided", () => {
		const a = whyValue(SRC, "sidebar.width");
		assert.ok(a.includes("Nothing in this design decides"));
	});

	it("fails gracefully on bad source", () => {
		const e = explain("title.fontSize = ==");
		assert.ok(!e.ok);
		assert.ok(e.errors.length > 0);
	});

	it("exprToWords speaks plainly", () => {
		assert.equal(exprToWords({ type: "dimension", value: 16, unit: "px" }), "16px");
		assert.equal(exprToWords({ type: "path", parts: ["title", "fontSize"] }), "the title font size");
		assert.equal(
			exprToWords({ type: "binary", op: "*", left: { type: "number", value: 4 }, right: { type: "path", parts: ["body", "fontSize"] } }),
			"4 × the body font size"
		);
	});
});

describe("teacher", () => {
	it("teaches a full lesson with four sections", () => {
		const lesson = teach(SRC);
		assert.ok(lesson.ok, JSON.stringify(lesson.errors));
		assert.equal(lesson.sections.length, 4);
		assert.deepEqual(
			lesson.sections.map((s) => s.title),
			["What was decided", "Why each choice was made", "The letters behind it", "How to judge it"]
		);
		assert.ok(lesson.sections[0].body.includes("64px"));
		assert.ok(lesson.sections[2].body.length > 0, "letters section has content");
	});

	it("cites letter sources", () => {
		const lesson = teach(SRC);
		const letters = lesson.sections[2];
		assert.ok(letters.citations.length > 0, "citations present");
		assert.ok(letters.body.includes("א") || letters.body.includes("Aleph") || letters.body.includes("letters"), "mentions letters");
	});

	it("answers 'why is the title so big?'", () => {
		const a = answerQuestion(SRC, "Why is the title so big?");
		assert.ok(a.includes("64px"), "traces to the value: " + a.slice(0, 120));
	});

	it("answers 'why is it beautiful?'", () => {
		const a = answerQuestion(SRC, "Why is it beautiful?");
		assert.ok(a.toLowerCase().includes("accidental"), "general beauty answer: " + a.slice(0, 120));
	});

	it("answers 'why is the body dark?'", () => {
		const src2 = "body.color = #2b2118\nbody.background = #fffdf6";
		const a = answerQuestion(src2, "Why is the body dark?");
		assert.ok(a.includes("#2b2118"), "traces to the color: " + a.slice(0, 120));
	});

	it("guides confused questions", () => {
		const a = answerQuestion(SRC, "blorple fnord?");
		assert.ok(a.includes('Ask me "why"'));
	});

	it("renders lesson markdown", () => {
		const md = lessonMarkdown(SRC);
		assert.ok(md.includes("# A Lesson in This Design"));
		assert.ok(md.includes("## What was decided"));
	});

	it("gives a one-line verdict", () => {
		const v = verdict(SRC);
		assert.ok(v.includes("Solves cleanly"));
		const bad = verdict("title.fontSize = ==");
		assert.ok(bad.includes("Not a design yet"));
	});

	it("teaches a failing design honestly", () => {
		const lesson = teach("title.fontSize = ==");
		assert.ok(!lesson.ok);
		assert.ok(lesson.errors.length > 0);
	});
});
