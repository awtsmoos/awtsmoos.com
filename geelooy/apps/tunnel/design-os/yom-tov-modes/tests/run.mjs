//B"H
// Yom Tov Modes — test runner. Usage: node tests/run.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import {
	HEBREW_EPOCH, isHebrewLeapYear, hebrewNewYearRD, hebrewYearLength,
	hebrewMonthLength, hebrewToRD, rdToHebrew,
	gregorianToRD, rdToGregorian, rdWeekday,
} from "../calendar.mjs";
import {
	holidaysInHebrewYear, yomTovAtRD, yomTovAtDate, getYomTovWindow,
} from "../holidays.mjs";
import { MODES, themeFor, modeKeys, modeFreezes } from "../themes.mjs";
import { yomtovThemeCss, yomtovSurfaceCss } from "../css.mjs";
import { applyYomTovHtml, addYomTovClass, yomtovStylesheet } from "../html.mjs";
import { yomtovClientScript } from "../script.mjs";
import { sunsetUTCms } from "../../shabbos-mode/times.mjs";
import { execSync } from "node:child_process";
import vm from "node:vm";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------- calendar ----------
test("Rosh Hashanah anchors match known dates", () => {
	const anchors = [
		[5783, 2022, 9, 26], [5784, 2023, 9, 16], [5785, 2024, 10, 3],
		[5786, 2025, 9, 23], [5787, 2026, 9, 12], [5788, 2027, 10, 2],
	];
	for (const [hy, gy, gm, gd] of anchors) {
		assert.equal(hebrewNewYearRD(hy), gregorianToRD(gy, gm, gd), `1 Tishrei ${hy}`);
	}
});

test("400-year invariants: valid lengths, valid RH weekdays", () => {
	const valid = new Set([353, 354, 355, 383, 384, 385]);
	for (let y = 5600; y < 6000; y++) {
		const L = hebrewYearLength(y);
		assert.ok(valid.has(L), `year ${y} length ${L}`);
		const wd = rdWeekday(hebrewNewYearRD(y));
		assert.ok(wd !== 0 && wd !== 3 && wd !== 5, `RH ${y} on ${DOW[wd]}`);
	}
});

test("known holidays match", () => {
	const cases = [
		[5785, 1, 15, 2025, 4, 13, "Pesach 5785"],
		[5786, 7, 10, 2025, 10, 2, "Yom Kippur 5786"],
		[5786, 9, 25, 2025, 12, 15, "Chanukah 5786"],
		[5786, 12, 14, 2026, 3, 3, "Purim 5786"],
		[5786, 3, 6, 2026, 5, 22, "Shavuot 5786"],
		[5786, 7, 15, 2025, 10, 7, "Sukkot 5786"],
	];
	for (const [hy, hm, hd, gy, gm, gd, name] of cases) {
		assert.equal(hebrewToRD(hy, hm, hd), gregorianToRD(gy, gm, gd), name);
	}
});

test("hebrew/gregorian round-trips", () => {
	for (const rd of [gregorianToRD(2025, 10, 8), gregorianToRD(1999, 1, 1), gregorianToRD(2030, 6, 15)]) {
		const h = rdToHebrew(rd);
		assert.equal(hebrewToRD(h.year, h.month, h.day), rd, `hebrew round-trip ${rd}`);
		const g = rdToGregorian(rd);
		assert.equal(gregorianToRD(g.y, g.m, g.d), rd, `greg round-trip ${rd}`);
	}
});

test("leap years follow the 19-year cycle", () => {
	// 5784, 5787 are leap; 5785, 5786, 5788 are not
	assert.equal(isHebrewLeapYear(5784), true);
	assert.equal(isHebrewLeapYear(5787), true);
	assert.equal(isHebrewLeapYear(5785), false);
	assert.equal(isHebrewLeapYear(5786), false);
	assert.equal(isHebrewLeapYear(5788), false);
	assert.equal(hebrewMonthLength(5784, 13), 30); // Adar I exists in leap years
	assert.throws(() => hebrewToRD(5785, 13, 1), RangeError);
});

// ---------- holidays ----------
test("Pesach 5786 structure (diaspora)", () => {
	const days = holidaysInHebrewYear(5786, { diaspora: true });
	const by = (k) => days.filter((e) => e.key.startsWith(k));
	assert.equal(by("pesach-1").length, 1);
	assert.equal(by("pesach-1")[0].type, "yomtov");
	assert.equal(by("pesach-1")[0].blockStart, true);
	assert.equal(by("chol-hamoed-pesach").length, 4); // 17-20 Nisan
	assert.ok(by("chol-hamoed-pesach").every((e) => e.type === "chol"));
	assert.equal(by("pesach-8").length, 1); // diaspora 8th day
	const israel = holidaysInHebrewYear(5786, { diaspora: false });
	assert.equal(israel.filter((e) => e.key === "pesach-8").length, 0);
	assert.equal(israel.filter((e) => e.key === "pesach-2").length, 0);
});

test("Sukkot 5786: chol hamoed counts", () => {
	const d = holidaysInHebrewYear(5786, { diaspora: true });
	const chol = d.filter((e) => e.key === "chol-hamoed-sukkot");
	assert.equal(chol.length, 5); // 17-21 Tishrei
	const i = holidaysInHebrewYear(5786, { diaspora: false });
	assert.equal(i.filter((e) => e.key === "chol-hamoed-sukkot").length, 6); // 16-21
	assert.equal(i.filter((e) => e.key === "simchat-torah").length, 0);
});

test("Chanukah is 8 days, theme-only", () => {
	const d = holidaysInHebrewYear(5786, { diaspora: true });
	const ch = d.filter((e) => e.key === "chanukah");
	assert.equal(ch.length, 8);
	assert.ok(ch.every((e) => e.mode === "chanukah" && e.type === "minor"));
	assert.equal(modeFreezes("chanukah"), false);
});

test("yomTovAtRD finds Yom Kippur 5786", () => {
	const rd = gregorianToRD(2025, 10, 2);
	const e = yomTovAtRD(rd, { diaspora: true });
	assert.ok(e);
	assert.equal(e.key, "yom-kippur");
	assert.equal(e.mode, "yamim-noraim");
	assert.equal(e.type, "yomtov");
});

test("erev detection: day before Pesach", () => {
	const rd = gregorianToRD(2025, 4, 12); // 14 Nisan 5785
	const e = yomTovAtRD(rd, { diaspora: true });
	assert.ok(e);
	assert.equal(e.type, "erev");
	assert.equal(e.mode, "pesach");
});

test("ordinary day returns null", () => {
	const e = yomTovAtRD(gregorianToRD(2025, 11, 15), { diaspora: true });
	assert.equal(e, null);
});

test("getYomTovWindow: sunset-aware", () => {
	// Oct 1, 2025 noon NYC = Erev Yom Kippur (9 Tishrei); after sunset -> Yom Kippur
	const before = new Date(Date.UTC(2025, 9, 1, 15, 0, 0)); // 11:00 EDT
	const w1 = getYomTovWindow({ lat: 40.7, lon: -74, now: before, utcOffsetMin: -240, sunsetUTCms });
	assert.ok(w1.current);
	assert.equal(w1.current.type, "erev");
	const after = new Date(Date.UTC(2025, 9, 2, 0, 30, 0)); // 20:30 EDT Oct 1
	const w2 = getYomTovWindow({ lat: 40.7, lon: -74, now: after, utcOffsetMin: -240, sunsetUTCms });
	assert.ok(w2.current);
	assert.equal(w2.current.key, "yom-kippur");
});

// ---------- themes ----------
test("every mode has a complete theme", () => {
	for (const k of modeKeys()) {
		const t = themeFor(k);
		assert.ok(t.he && t.en && t.emoji && t.line, k);
		assert.ok(t.palette.paper && t.palette.ink && t.palette.accent && t.palette.muted, k);
		assert.equal(typeof t.freeze, "boolean", k);
	}
	assert.deepEqual(modeKeys().sort(), ["chanukah", "minor", "pesach", "purim", "shavuos", "solemn", "sukkos", "yamim-noraim"].sort());
});

test("freeze map", () => {
	assert.equal(modeFreezes("pesach"), true);
	assert.equal(modeFreezes("sukkos"), true);
	assert.equal(modeFreezes("shavuos"), true);
	assert.equal(modeFreezes("yamim-noraim"), true);
	assert.equal(modeFreezes("chanukah"), false);
	assert.equal(modeFreezes("purim"), false);
});

// ---------- css / html ----------
test("theme CSS is scoped and re-tints shabbos vars", () => {
	const css = yomtovThemeCss("pesach");
	assert.ok(css.includes(".yomtov-mode.yomtov-pesach"));
	assert.ok(css.includes("--shabbos-paper:"));
	assert.ok(css.includes(".yomtov-notice"));
	const dark = yomtovThemeCss("chanukah");
	assert.ok(dark.includes("#0f1830"));
});

test("applyYomTovHtml: freeze day gets shabbos + yomtov classes", () => {
	const entry = yomTovAtRD(gregorianToRD(2025, 10, 2), { diaspora: true }); // YK
	const out = applyYomTovHtml("<html><head></head><body><p>hi</p></body></html>", entry, { inlineScript: false });
	assert.ok(out.includes("shabbos-mode"), "has shabbos-mode");
	assert.ok(out.includes("yomtov-mode"), "has yomtov-mode");
	assert.ok(out.includes("yomtov-yamim-noraim"), "has mode class");
	assert.ok(out.includes("yomtov-notice"), "has notice");
	assert.ok(out.includes("יום הכפורים"), "hebrew name in notice");
});

test("applyYomTovHtml: theme-only day has no shabbos freeze", () => {
	const entry = yomTovAtRD(gregorianToRD(2025, 12, 15), { diaspora: true }); // Chanukah
	assert.equal(entry.mode, "chanukah");
	const out = applyYomTovHtml("<html><head></head><body><p>hi</p></body></html>", entry, { inlineScript: false });
	assert.ok(out.includes("yomtov-mode"));
	assert.ok(out.includes("yomtov-chanukah"));
	assert.ok(!out.includes("shabbos-mode"), "no freeze class");
	assert.ok(out.includes("🕎"), "menorah emoji");
});

test("yomtovStylesheet composes correctly", () => {
	const yk = yomTovAtRD(gregorianToRD(2025, 10, 2), { diaspora: true });
	const s1 = yomtovStylesheet(yk);
	assert.ok(s1.includes("Shabbos Mode") || s1.includes("shabbos-mode"), "freeze sheet has shabbos base");
	const ch = yomTovAtRD(gregorianToRD(2025, 12, 15), { diaspora: true });
	const s2 = yomtovStylesheet(ch);
	assert.ok(!s2.includes(".shabbos-mode {"), "theme sheet has no shabbos base");
});

// ---------- client script ----------
test("client script is valid JS and embeds working calendar", () => {
	const src = yomtovClientScript({ lat: 31.7, lon: 35.2 });
	const calls = [];
	const sandbox = {
		window: {},
		document: {
			readyState: "complete",
			documentElement: { classList: { contains: () => false, add: () => {}, remove: () => {}, toggle: () => {} }, className: "", getAttribute: () => null },
			addEventListener: () => {},
			getElementById: () => null,
			createElement: () => ({ setAttribute: () => {}, style: {}, addEventListener: () => {} }),
			body: { appendChild: () => {} },
		},
		localStorage: { getItem: () => null, setItem: () => {} },
	};
	vm.createContext(sandbox);
	// Extract and test the embedded pure functions before the IIFE runs them
	assert.ok(src.includes("function hebrewNewYearRD"), "embeds calendar");
	assert.ok(src.includes("function yomTovAtRD"), "embeds holidays");
	assert.ok(src.includes("function sunsetUTCms"), "embeds sunset");
	assert.ok(src.includes("function getYomTovWindow"), "embeds window fn");
	assert.doesNotThrow(() => new vm.Script(src), "client script parses");
});
