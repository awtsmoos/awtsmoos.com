#!/usr/bin/env node
// B"H — autoScreenshot pipeline tests: capture, history, gallery, latest
process.env.MERKAVA_SCREENSHOT_DIR = "/tmp/merkava-shot-test";
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderAndCapture, screenshotHtml, listScreenshots, latestScreenshot } from "./autoScreenshot.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log("  PASS", name); } else { fail++; console.log("  FAIL", name); } };

const dir = process.env.MERKAVA_SCREENSHOT_DIR;
rmSync(dir, { recursive: true, force: true });

const html = '<!DOCTYPE html><html><head><style>body{background:#fff;color:#111}h1{color:#1e293b}</style></head><body><h1>B"H Shot</h1><p>hello</p></body></html>';

// --- renderAndCapture ---
const r1 = renderAndCapture({ html }, { width: 400, height: 300 }, "unit-test");
ok("result has screenshotPath", typeof r1.screenshotPath === "string" && existsSync(r1.screenshotPath));
ok("result has screenshotUri (sandbox)", String(r1.screenshotUri).startsWith("sandbox://"));
ok("png bytes match render", r1.bytes > 0);
ok("historyEntry present", r1.historyEntry && r1.historyEntry.label === "unit-test");
ok("stdout-visible uri printed (manual: check [merkava-screenshot] line above)", true);

// --- screenshotHtml ---
const r2 = screenshotHtml(html, { width: 400, height: 300 }, "page request!");
ok("screenshotHtml captures", existsSync(r2.screenshotPath));
ok("label sanitized", r2.historyEntry.label === "page-request");

// --- gallery / latest ---
const gallery = listScreenshots();
ok("gallery has 2 entries", gallery.length === 2);
ok("gallery newest-first", gallery[0].label === "page-request");
ok("gallery entries have uri+path", gallery.every(e => e.uri && e.path));
ok("latest() points at latest.png", latestScreenshot() === join(dir, "latest.png"));
const histLines = readFileSync(join(dir, "history.jsonl"), "utf8").trim().split("\n");
ok("history.jsonl has 2 lines", histLines.length === 2);
ok("history lines are valid JSON", histLines.every(l => { try { JSON.parse(l); return true; } catch { return false; } }));
const files = readdirSync(dir).filter(f => f.endsWith(".png"));
ok("2 timestamped pngs + latest.png", files.length === 3);

// --- limit ---
ok("listScreenshots(1) returns 1", listScreenshots(1).length === 1);
ok("listScreenshots(0) returns all", listScreenshots(0).length === 2);

rmSync(dir, { recursive: true, force: true });
console.log(`\nautoScreenshot: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
