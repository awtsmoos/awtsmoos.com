// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides the isolated Living Library browser fixture.
 * @description
 * The Awtsmoos places source, comments, disclosure, and safe markup into one small
 * browser world. The fixture verifies the current source-status and comment-meta
 * contracts without coupling the test runner to obsolete wording.
 */
const directory = "geelooy/mawgawl/sefarim";
const entry = `${directory}/renderer-integration.html`;
const files = [
	`${directory}/commentMerge.js`,
	`${directory}/rangeComments.js`,
	`${directory}/rangeResults.js`,
	`${directory}/safeMarkup.js`,
	`${directory}/searchView.js`
];

function html() {
	return `<!doctype html>
		<title>Living Library renderer integration</title>
		<link rel="icon" href="data:,">
		<main id="proof" data-ok="pending"></main>
		<script type="module">
			import { renderSearch } from "./searchView.js";
			const row = {
				heichelId:"ikar", seriesId:"s1", postId:"p1",
				aliasId:"sichos_kodesh_translation_en",
				subChunkIndex:0, verseStart:1, verseEnd:1,
				title:"Source", text:"<strong>Safe source</strong>"
			};
			const comments = [1, 2, 3].map(number => ({
				id:"ranked-" + number,
				parent:{...row},
				row:{
					id:"comment-" + number,
					content:"Comment " + number,
					verseSection:1,
					subsectionId:number,
					ragCommentSource:"sichosKodeshDocumentSidecar"
				}
			}));
			const results = document.createElement("section");
			const status = document.createElement("p");
			document.body.append(status, results);
			renderSearch({
				search:{hits:[{row, score:0.9}], commentHits:comments, mode:"text"},
				results,
				status,
				query:"proof"
			});
			const details = results.querySelector("details");
			const reveal = results.querySelector(".commentRevealButton");
			const initialRows = results.querySelectorAll(".rangeCommentStatic").length;
			reveal?.click();
			const finalRows = results.querySelectorAll(".rangeCommentStatic").length;
			const meta = results.querySelector(".rangeMeta")?.textContent || "";
			const passed = details?.open
				&& initialRows === 2
				&& finalRows === 3
				&& !results.querySelector(".commentRevealButton")
				&& status.textContent.includes("1 source found")
				&& meta.includes("3 comments available")
				&& results.querySelector(".rangePreview strong")?.textContent === "Safe source";
			const proof = document.querySelector("#proof");
			proof.dataset.ok = String(Boolean(passed));
			proof.textContent = passed ? "B'H renderer passed" : "renderer failed";
		</script>`;
}

module.exports = {
	entry,
	files,
	html
};
