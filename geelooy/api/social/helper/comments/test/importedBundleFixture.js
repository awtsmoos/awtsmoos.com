// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const os = require("os");
const path = require("path");

/** Creates two minimal external imported-comment bundles for source tests. */
function create() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-bundle-fixture-"));
	writeBundle(root, {
		bundle: "sichosKodesh",
		seriesId: "sichosKodesh5741",
		postId: "sichos-fixture",
		rows: [
			row("sichos-1", "translation", "The Awtsmoos reveals living wisdom."),
			row("sichos-2", "translation", "A second translated teaching.")
		]
	});
	writeBundle(root, {
		bundle: "meluket",
		seriesId: "אדר_meluket",
		postId: "meluket-fixture",
		rows: [
			row("summary-1", "sectionSummaryBrief", "A bounded summary."),
			row("translation-1", "translation", "A bounded translation.")
		]
	});
	return {
		root,
		remove: () => fs.rmSync(root, { recursive: true, force: true })
	};
}

function writeBundle(root, options) {
	const bundleRoot = path.join(root, options.bundle);
	const postFile = "posts/fixture.json";
	fs.mkdirSync(path.join(bundleRoot, "posts"), { recursive: true });
	fs.writeFileSync(path.join(bundleRoot, "manifest.json"), JSON.stringify({
		fingerprint: `${options.bundle}-fixture-v1`,
		counts: {
			series: 1,
			posts: 1,
			rows: options.rows.length,
			translations: options.rows.filter(item => item.dayuh.kind === "translation").length,
			summaries: options.rows.filter(item => item.dayuh.kind !== "translation").length
		},
		series: { [options.seriesId]: [options.postId] },
		posts: { [`${options.seriesId}\0${options.postId}`]: postFile }
	}));
	fs.writeFileSync(path.join(bundleRoot, postFile), JSON.stringify({
		seriesId: options.seriesId,
		postId: options.postId,
		rows: options.rows
	}));
}

function row(id, kind, content) {
	return {
		id,
		content,
		verseSection: "1",
		subsectionId: id,
		dayuh: { kind, language: "en" }
	};
}

module.exports = { create };
