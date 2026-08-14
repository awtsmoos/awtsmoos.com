// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const Fixture = require("./importedBundleFixture.js");

/** Proves translation behavior against external runtime data, never repository data. */
const fixture = Fixture.create();
process.env.AWTSMOOS_IMPORTED_COMMENT_DATA_ROOT = fixture.root;

const { familyFor } = require("../imported/registry.js");
const bundles = require("../imported/bundleStore.js");
const { loadImported } = require("../imported/orchestrator.js");
const { postTranslations, translationRows } = require("../translations/reader.js");
const { searchTranslations } = require("../translations/search.js");

function fakeInput() {
	return {
		db: {
			async getValue() {
				return { id: "active-post", title: "Teaching", dayuh: { sections: [] } };
			}
		}
	};
}

async function run() {
	try {
		assert.deepStrictEqual(family("sichosKodesh5741"), {
			type: "bundle",
			alias: "sichos_kodesh_translation_en",
			bundle: "sichosKodesh"
		});
		assert.deepStrictEqual(family("אדר_meluket"), {
			type: "bundle",
			alias: "meluket_translation_en",
			bundle: "meluket"
		});
		assert.equal(bundles.manifest("sichosKodesh").counts.rows, 2);
		assert.equal(bundles.manifest("meluket").counts.summaries, 1);
		const $i = fakeInput();
		const sichosReport = await postTranslations({
			$i,
			heichelId: "ikar",
			seriesId: "sichosKodesh5741",
			postId: "sichos-fixture"
		});
		assert.equal(sichosReport.success.length, 2);
		assert.ok(sichosReport.success.every(row => row.dayuh?.kind === "translation"));
		const imported = await loadImported({
			$i,
			heichelId: "ikar",
			seriesId: "אדר_meluket",
			postId: "meluket-fixture",
			verseSection: "",
			subsectionId: ""
		});
		assert.equal(translationRows(imported.rows).length, 1);
		assert.equal(imported.rows.length, 2);
		const searched = await searchTranslations({
			$i,
			heichelId: "ikar",
			seriesId: "sichosKodesh5741",
			query: "living wisdom",
			limit: 3
		});
		assert.equal(searched.success.length, 1);
		assert.equal(searched.success[0].postId, "sichos-fixture");
		console.log("translationBundles.test.js PASS");
	} finally {
		fixture.remove();
	}
}

function family(seriesId) {
	const value = familyFor(seriesId);
	return { type: value.type, alias: value.alias, bundle: value.bundle };
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
