// B"H — posts.needsWork gap detectors: unit tests (no DB, no network).
const assert = require("node:assert");
const {
	detectPostGaps,
	collectText,
	countPageMarkers,
	GAP_PRIORITY,
	GAP_LABEL
} = require("./needsWorkRoutes.js");

let passed = 0;
function check(name, cond) {
	assert(cond, `FAILED: ${name}`);
	passed++;
	console.log(`  ok - ${name}`);
}

const NO_CONVENTIONS = { footnoteShare: 0, pageMarkerShare: 0, footnoteFieldSeen: false };
const FULL_CONVENTIONS = { footnoteShare: 0.8, pageMarkerShare: 0.8, footnoteFieldSeen: true };

// --- commentary-shaped post ---
const commentaryPost = {
	postId: "tanach-rashi-x",
	author: "rashi-alias",
	title: "Rashi on Genesis 1:1",
	units: [
		{ ref: "1:1", hebrew: "בראשית", english: "In the beginning", phrases: [{ hebrew: "בראשית", english: "In the beginning" }] },
		{ ref: "1:2", hebrew: "והארץ", english: "", phrases: [] }
	]
};

let r = detectPostGaps(commentaryPost, NO_CONVENTIONS);
check("commentary: missing translation detected", r.gaps.includes("missing_translation"));
check("commentary: missing phrase translations detected", r.gaps.includes("missing_phrase_translations"));
check("commentary: detail counts", r.detail.missing_translation.unitsMissing === 1 && r.detail.missing_translation.unitsTotal === 2);

const cleanCommentary = {
	author: "rashi-alias",
	units: [{ hebrew: "א", english: "b", phrases: [{ hebrew: "א", english: "b" }] }]
};
r = detectPostGaps(cleanCommentary, NO_CONVENTIONS);
check("commentary: clean post has no gaps", r.gaps.length === 0);

// --- chassidus-shaped post ---
const chassidusPost = {
	postId: "s5666-001",
	author: "re Rashab",
	title: "Hemshech 5666 maamar 1",
	source: { sections: [{ originalText: "יום טוב של ר״ה [p. 5] המשך" }] },
	translation: { readable: "" },
	phraseTranslations: [],
	summaries: [],
	footnotes: []
};
r = detectPostGaps(chassidusPost, FULL_CONVENTIONS);
check("chassidus: empty readable flagged", r.gaps.includes("missing_translation"));
check("chassidus: empty phraseTranslations flagged", r.gaps.includes("missing_phrase_translations"));
check("chassidus: empty summaries flagged", r.gaps.includes("missing_summaries"));
check("chassidus: empty footnotes flagged when series uses them", r.gaps.includes("missing_footnotes"));
check("chassidus: page marker present, not flagged", !r.gaps.includes("missing_page_markers"));

const noMarkerPost = {
	author: "x",
	source: { sections: [{ originalText: "טקסט בלי סימון עמוד" }] },
	translation: { readable: "Some translation." }
};
r = detectPostGaps(noMarkerPost, FULL_CONVENTIONS);
check("page markers: missing flagged when series uses them", r.gaps.includes("missing_page_markers"));
r = detectPostGaps(noMarkerPost, NO_CONVENTIONS);
check("page markers: not flagged when series does not use them", !r.gaps.includes("missing_page_markers"));

const brokenMarkerPost = {
	author: "x",
	source: { sections: [{ originalText: "טקסט [p. abc] שבור" }] },
	translation: { readable: "t" }
};
r = detectPostGaps(brokenMarkerPost, NO_CONVENTIONS);
check("page markers: broken marker detected", r.gaps.includes("broken_page_markers"));
check("page markers: broken detail count", r.detail.broken_page_markers.broken === 1);

const noAuthorPost = { units: [{ hebrew: "א", english: "b", phrases: [{ hebrew: "א", english: "b" }] }] };
r = detectPostGaps(noAuthorPost, NO_CONVENTIONS);
check("alias link: blank author flagged", r.gaps.includes("no_alias_link"));

// --- helpers ---
check("countPageMarkers valid", countPageMarkers("[p. 12] x [p.13]").valid === 2);
check("countPageMarkers broken", countPageMarkers("[p. x] [p. 4]").broken === 1);
check("collectText gathers sections", collectText({ source: { sections: [{ originalText: "שלום" }] } }).includes("שלום"));
check("priorities: translation is p1", GAP_PRIORITY.missing_translation === 1);
check("priorities: summaries is p3", GAP_PRIORITY.missing_summaries === 3);
check("labels present", typeof GAP_LABEL.missing_translation === "string");

console.log(`\nneedsWork detectors: ${passed} passed`);
