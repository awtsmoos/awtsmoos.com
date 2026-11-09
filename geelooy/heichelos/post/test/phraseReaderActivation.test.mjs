// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — per-phrase English activation: the translation API's aligned
 * phrases must turn into the phraseTranslations shape the Meluket phrase
 * reader consumes, and the post content's הערות section must yield its
 * footnote bodies, so tapping a footnote still opens its text after the
 * restructure. Coby's rule (Nov 10, 2026): English ALWAYS rides per phrase.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
	alignedPhrasesCoverPost,
	buildPhraseTranslations,
	extractPostFootnotes
} from "../translations/phraseReaderActivation.js";

// B"H — the dynamic import path must resolve to a real file. A wrong
// relative path 404s in the browser and the sefer silently never mounts.
test("dynamic import of MeluketSeferReader resolves to an existing file", () => {
	const src = readFileSync(new URL("../translations/phraseReaderActivation.js", import.meta.url), "utf8");
	const m = src.match(/await import\(\s*"([^"]+MeluketSeferReader\.js[^"]*)"/);
	assert.ok(m, "phraseReaderActivation.js must dynamically import MeluketSeferReader.js");
	const specifier = m[1].split("?")[0];
	const resolved = new URL(specifier, new URL("../translations/phraseReaderActivation.js", import.meta.url));
	assert.ok(existsSync(resolved), "MeluketSeferReader.js must exist at " + resolved.pathname);
});

const POST = { id: "BH_POST_TEST", postId: "BH_POST_TEST", content: "" };

function apiRow(verseSection, subsectionId, sourceHebrew, content) {
	return { verseSection, subsectionId, sourceHebrew, content };
}

test("buildPhraseTranslations turns aligned API rows into phraseTranslations", () => {
	const rows = [
		apiRow(0, 0, "בס\"ד.", "B\"S."),
		apiRow(0, 1, "ש\"פ חיי שרה,", "Shabbos Parshas Chayei Sarah,"),
		apiRow(1, 0, "ואברהם זקן בא בימים גו'1,", "\"And Avraham was old, advanced in days,\" etc.1,")
	];
	const phrases = buildPhraseTranslations(POST, rows);
	assert.equal(phrases.length, 3);
	assert.equal(phrases[0].sectionId, "0");
	assert.equal(phrases[0].phraseId, "0");
	assert.equal(phrases[0].source.hebrew, "בס\"ד.");
	assert.equal(phrases[0].en, "B\"S.");
	assert.equal(phrases[0].postId, "BH_POST_TEST");
	assert.equal(phrases[0].provenance, "translation-api");
	assert.equal(phrases[2].sectionId, "1");
});

test("buildPhraseTranslations skips rows with no Hebrew source", () => {
	const rows = [
		apiRow(0, 0, "בס\"ד.", "B\"S."),
		apiRow(0, 1, "", "Orphan English with no Hebrew."),
		apiRow(0, 2, "   ", "Whitespace-only Hebrew.")
	];
	const phrases = buildPhraseTranslations(POST, rows);
	assert.equal(phrases.length, 1);
	assert.equal(phrases[0].source.hebrew, "בס\"ד.");
});

test("extractPostFootnotes parses the הערות section into numbered bodies", () => {
	const content = [
		"Some Hebrew body.",
		"",
		"**English translation:**",
		"",
		"Some English.",
		"",
		"הערות:**",
		"",
		"<sup>1</sup> פרשתנו (חיי שרה) כד, א.<br/>",
		"our parshah (Chayei Sarah) 24a.",
		"",
		"<sup>2</sup> בראשית ב, א.<br/>",
		"Bereishis 2:1.",
		"",
		"<sup>61</sup> שו\"ע אדמו\"ר הזקן או\"ח סרע\"ד ס\"ה. וש\"נ.<br/>",
		"Shulchan Aruch of the Alter Rebbe, Orach Chaim, siman 274, se'if 5. And the sources noted there."
	].join("\n");
	const notes = extractPostFootnotes(content);
	assert.equal(notes.length, 3);
	assert.deepEqual(notes[0], { n: 1, hebrew: "פרשתנו (חיי שרה) כד, א.", english: "our parshah (Chayei Sarah) 24a." });
	assert.equal(notes[2].n, 61);
	assert.match(notes[2].english, /Alter Rebbe/);
});

test("extractPostFootnotes returns empty when there is no הערות section", () => {
	assert.deepEqual(extractPostFootnotes("No notes here."), []);
	assert.deepEqual(extractPostFootnotes(""), []);
});

test("alignedPhrasesCoverPost requires the phrases to cover the Hebrew", () => {
	const hebrew = "בס\"ד. ש\"פ חיי שרה, מבה\"ח כסלו, ה'תשמ\"ו. ואברהם זקן בא בימים.";
	const content = hebrew + "\n\n**English translation:**\n\nB\"S. Shabbos Parshas Chayei Sarah.";
	const full = buildPhraseTranslations(POST, [
		apiRow(0, 0, "בס\"ד.", "B\"S."),
		apiRow(0, 1, "ש\"פ חיי שרה,", "Shabbos Parshas Chayei Sarah,"),
		apiRow(0, 2, "מבה\"ח כסלו, ה'תשמ\"ו.", "Mevarchim Chodesh Kislev, 5746."),
		apiRow(0, 3, "ואברהם זקן בא בימים.", "And Avraham was old, advanced in days.")
	]);
	assert.equal(alignedPhrasesCoverPost(full, content), true);
	const thin = buildPhraseTranslations(POST, [apiRow(0, 0, "בס\"ד.", "B\"S.")]);
	assert.equal(alignedPhrasesCoverPost(thin, content), false);
	assert.equal(alignedPhrasesCoverPost(full, ""), false);
});
