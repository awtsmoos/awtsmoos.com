// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const installRoot = path.join(os.tmpdir(), `awtsmoos-library-renderer-${process.pid}`);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const { findChrome } = require("../tools/chrome/finder.js");
const ChromeProcesses = require("../tools/chrome/processes.js");
const { isolatedHtmlTest } = require("../tools/fs/isolatedHtml.js");

const repositoryRoot = path.resolve(__dirname, "../../../../..");
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
				search:{
					hits:[{row, score:0.9}],
					commentHits:comments,
					mode:"text"
				},
				results,
				status,
				query:"proof"
			});
			const details = results.querySelector("details");
			const reveal = results.querySelector(".commentRevealButton");
			const initialRows = results.querySelectorAll(".rangeCommentStatic").length;
			reveal?.click();
			const finalRows = results.querySelectorAll(".rangeCommentStatic").length;
			const passed = details?.open
				&& initialRows === 2
				&& finalRows === 3
				&& !results.querySelector(".commentRevealButton")
				&& status.textContent.includes("3 linked comments")
				&& results.querySelector(".rangePreview strong")?.textContent === "Safe source";
			const proof = document.querySelector("#proof");
			proof.dataset.ok = String(Boolean(passed));
			proof.textContent = passed ? "B'H renderer passed" : "renderer failed";
		</script>`;
}

async function run() {
	if (!findChrome()) {
		console.log(JSON.stringify({
			ok: true,
			suite: "living-library-renderer-integration",
			skipped: true,
			reason: "chrome_not_installed"
		}, null, 2));
		return;
	}
	try {
		const result = await isolatedHtmlTest(
			{ root: repositoryRoot, allowWrite: true, allowCommands: true },
			{
				files,
				entry,
				urlPath: entry,
				html: html(),
				selector: '#proof[data-ok="true"]',
				assertNoConsoleErrors: true,
				timeoutMs: 20000
			}
		);
		assert.equal(result.ok, true, JSON.stringify(result));
		assert.equal(result.browser.selectorFound, true);
		assert.equal(result.browser.errorCount, 0);
		assert.equal(await ChromeProcesses.waitForClosed(result.browser.port, 3000), true);
		await new Promise(resolve => setTimeout(resolve, 500));
		await assert.rejects(fs.stat(result.sandbox), { code: "ENOENT" });

		console.log(JSON.stringify({
			ok: true,
			suite: "living-library-renderer-integration",
			rankedCommentsMerged: true,
			firstWindowOpened: true,
			progressiveDisclosure: "2-to-3",
			staticSidecarsNotMislinked: true,
			safeMarkupPreserved: true,
			browserStopped: true,
			sandboxRemoved: true
		}, null, 2));
	} finally {
		await fs.rm(installRoot, {
			recursive: true,
			force: true,
			maxRetries: 10,
			retryDelay: 100
		});
		await fs.rm(`${installRoot}-recovery`, {
			recursive: true,
			force: true,
			maxRetries: 10,
			retryDelay: 100
		});
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
