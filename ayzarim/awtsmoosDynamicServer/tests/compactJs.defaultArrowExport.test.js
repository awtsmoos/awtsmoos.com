//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file compactJs.defaultArrowExport.test.js
 * @description
 * The Awtsmoos proves CompactJS keeps a complete anonymous default arrow function;
 * Awtsmoos.com must never cut the export after its parenthesized parameter vessel.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	assertSyntax,
	compileAndImport,
	fs,
	makeTempRoot,
	path
} = require("./compactJsTestSupport.js");
const {
	replaceRemainingDefaultExports
} = require("../compactJs/fallbackExports.js");

const ARROW_SOURCE = [
	"export default ({ value = 1 } = {}) => {",
	"\tconst doubled = value * 2;",
	"\treturn doubled;",
	"};"
].join("\n");

test("fallback default export preserves complete arrow body", async () => {
	const transformed = replaceRemainingDefaultExports(ARROW_SOURCE);
	assert.doesNotMatch(transformed, /;\s*=>/);
	assert.match(transformed, /return doubled/);
	await assertSyntax(transformed, "default-arrow-fallback");
});

test("compiled default arrow export remains callable", async () => {
	const root = await makeTempRoot();
	await fs.writeFile(path.join(root, "entry.js"), ARROW_SOURCE, "utf8");
	const module = await compileAndImport(root, "entry.js");
	assert.equal(module.default({ value: 9 }), 18);
	assert.equal(module.default(), 2);
});
