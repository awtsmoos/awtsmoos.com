//B"H
/**
 * @file Tests for the Hebrew-First Design System.
 * @description Uses REAL Torah text (Genesis 1:1 with taamim + nikkud, from the
 * local Tanakh sources) plus constructed edge cases (gershayim, maqaf, mixed
 * Hebrew/Latin). Run: node test.mjs — exits nonzero on any failure.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
	hebrewFirst,
	planFor,
	analyzeHebrew,
	structuralCSS,
	generateHebrewCSS,
	listHebrewBundles,
	HF_BUNDLE_COUNT,
	logicalInline,
	physicalSide,
	DEFAULT_DIRECTION,
	LINE_HEIGHT_POLICY,
	endsWithSofit,
} from "./index.mjs";
import { design } from "../constraints/index.mjs";
import { getHebrewBundle } from "./constraints.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GENESIS = "/home/hatch/workspace/ikar-corpora/sources/Tanakh/Torah/Genesis__dff51effc8.json";

let passed = 0;
let failed = 0;
function check(name, cond, detail = "") {
	if (cond) {
		passed++;
		console.log(`  PASS ${name}`);
	} else {
		failed++;
		console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`);
	}
}

// ─── Load real Torah text ──────────────────────────────────────────
console.log("== loading Genesis 1:1 (taamim + nikkud) ==");
const genesis = JSON.parse(readFileSync(GENESIS, "utf8"));
const verse11 = genesis.text[0][0]; // "<big>בְּ</big>רֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃"
console.log("  raw:", verse11.slice(0, 60) + "…");

// ─── Analyzer on real Torah text ───────────────────────────────────
console.log("== analyzer: Genesis 1:1 ==");
const a = analyzeHebrew(verse11);
check("hasHebrew", a.hasHebrew === true);
check("hasTaamim", a.hasTaamim === true, `taamimCount=${a.taamimCount}`);
check("taamimCount>0", a.taamimCount > 0);
check("hasNikkud", a.hasNikkud === true, `nikkudCount=${a.nikkudCount}`);
check("nikkudCount>0", a.nikkudCount > 0);
check("sofit letters found (הארץ ץ)", a.sofitCount > 0, `sofitCount=${a.sofitCount}`);
check("sof pasuq found (׃)", a.hasSofPasuq === true);
check("taamim line-height recommended", a.recommendedLineHeight === LINE_HEIGHT_POLICY.taamim,
	`got ${a.recommendedLineHeight}`);
check("taamim bundle recommended", a.recommendedBundles.includes("hf-taamim-type"));
check("nikkud bundle recommended", a.recommendedBundles.includes("hf-nikkud-type"));
check("rtl-default bundle recommended", a.recommendedBundles.includes("hf-rtl-default"));

// ─── Edge cases ────────────────────────────────────────────────────
console.log("== analyzer: edge cases ==");
const gersh = analyzeHebrew("ד״ה בראשית אמר ר׳ עקיבא");
check("gershayim detected", gersh.hasGershayim === true);
check("sofit-gershayim bundle for gershayim",
	gersh.recommendedBundles.includes("hf-sofit-gershayim"));
const maqaf = analyzeHebrew("וַיֹּאמֶר־אֵלָיו מֵהֹדּוּ־וְעַד־כּוּשׁ");
check("maqaf detected", maqaf.hasMaqaf === true);
const mixed = analyzeHebrew("בראשית (Genesis 1:1) ברא אלוהים");
check("mixed Latin detected", mixed.hasLatin === true);
check("mixed note mentions bidi", mixed.notes.some((n) => n.includes("bdi")));
const plain = analyzeHebrew("שלום עולם");
check("plain Hebrew: no taamim", plain.hasTaamim === false);
check("plain Hebrew: line-height 1.5", plain.recommendedLineHeight === 1.5);
check("endsWithSofit('הארץ')", endsWithSofit("הארץ") === true);
check("endsWithSofit('ברא') is false", endsWithSofit("ברא") === false);

// ─── RTL direction system ──────────────────────────────────────────
console.log("== rtl direction system ==");
check("default direction is rtl", DEFAULT_DIRECTION === "rtl");
check("logicalInline(margin,start)", logicalInline("margin", "start") === "margin-inline-start");
check("physicalSide(start,rtl)=right", physicalSide("start", "rtl") === "right");
check("physicalSide(start,ltr)=left", physicalSide("start", "ltr") === "left");

// ─── Constraint bundles parse + solve ──────────────────────────────
console.log("== bundles: parse, validate, solve ==");
check("bundle count = 9", HF_BUNDLE_COUNT === 9, `got ${HF_BUNDLE_COUNT}`);
for (const name of listHebrewBundles()) {
	const src = getHebrewBundle(name);
	// Mirror the pipeline: seed body + hebrew font sizes (relative line-height
	// guards need a concrete hebrew.fontSize to check against).
	const r = design(`body.fontSize = 16px\nhebrew.fontSize = body.fontSize\n${src}`);
	check(`bundle '${name}' solves`, r.ok === true,
		r.ok ? "" : r.errors.slice(0, 2).join(" | "));
}

// Combined: default set + taamim tier + sefer page (the realistic program)
const combined = design([
	"body.fontSize = 16px",
	getHebrewBundle("hf-rtl-default"),
	getHebrewBundle("hf-font-stack"),
	getHebrewBundle("hf-bidi"),
	getHebrewBundle("hf-nikkud-guard"),
	getHebrewBundle("hf-nikkud-type"),
	getHebrewBundle("hf-taamim-type"),
	getHebrewBundle("hf-sofit-gershayim"),
	getHebrewBundle("hf-sefer-rtl"),
].join("\n"));
check("combined program solves", combined.ok === true,
	combined.ok ? "" : combined.errors.slice(0, 3).join(" | "));
if (combined.ok) {
	check("hebrew.fontSize = 64px (4x base)",
		combined.values["hebrew.fontSize"] === "64px",
		`got ${combined.values["hebrew.fontSize"]}`);
	check("root.direction = rtl", combined.values["root.direction"] === "rtl");
	check("latin.direction = ltr (opt-in)", combined.values["latin.direction"] === "ltr");
}

// ─── Full pipeline on real Torah text ──────────────────────────────
console.log("== pipeline: hebrewFirst(Genesis 1:1) ==");
const r = hebrewFirst(verse11);
check("pipeline ok", r.ok === true, r.ok ? "" : r.errors.slice(0, 3).join(" | "));
if (r.ok) {
	const css = r.css;
	check("CSS has RTL default", css.includes("direction: rtl"));
	check("CSS has latin-mode opt-in", css.includes(".latin-mode"));
	check("CSS has Hebrew serif stack", css.includes("Noto Serif Hebrew"));
	check("CSS has taamim tier", css.includes("--hebrew-lh-taamim: 1.9"));
	check("CSS never hyphenates Hebrew", css.includes("hyphens: none"));
	check("CSS never transforms Hebrew", css.includes("text-transform: none"));
	check("CSS isolates Latin runs", css.includes("unicode-bidi: isolate"));
	check("CSS no-break for acronyms", css.includes(".he-acronym"));
	check("CSS uses logical properties", css.includes("inline-start") || css.includes("padding-block"));
	check("CSS has no physical left/right (logical only)",
		!/margin-left|margin-right|padding-left|padding-right/.test(css),
		"physical props found");
	check("no unmapped warnings", r.warnings.length === 0,
		r.warnings.slice(0, 3).join(" | "));
	// CSS validity sanity: no quoted keyword values (:"isolate"), balanced braces.
	check("CSS has no quoted keyword values", !/:\s*"[a-z-]+"/.test(css.replace(/font-family:[^;]+;/g, "")),
		"found quoted non-font value");
	const opens = (css.match(/{/g) || []).length;
	const closes = (css.match(/}/g) || []).length;
	check("CSS braces balanced", opens === closes && opens > 0, `${opens} vs ${closes}`);
}

// ─── planFor ───────────────────────────────────────────────────────
console.log("== planFor ==");
const plan = planFor(verse11);
check("plan lineHeight 1.9", plan.lineHeight === 1.9);
check("plan includes taamim bundle", plan.bundles.includes("hf-taamim-type"));

// ─── structuralCSS standalone ──────────────────────────────────────
console.log("== structuralCSS ==");
const scss = structuralCSS();
check("structural: :root direction rtl", scss.includes(":root") && scss.includes("direction: rtl"));
check("structural: marks never clipped", scss.includes("overflow: visible"));

// ─── Summary ───────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
