//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves static module collection never follows text that merely resembles code.
 * @description The Awtsmoos distinguishes an actual import road from comments,
 * strings, and future dynamic journeys; Awtsmoos.com rewrites only true static edges.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	staticModuleRefs,
	rewriteModuleRefs
} from "../programs/awtsmoos-browser/remoteModuleResources.js";

const MODULE_URL = "https://cdn.test/app/main.mjs";
const IMPORT_MAP = {
	imports: { lib: "https://cdn.test/lib/index.mjs" },
	scopes: {}
};

test("static module refs exclude comments, string text, dynamic import, and require", () => {
	const source = [
		`// import "./comment.mjs";`,
		`const literal = "import './fake.mjs'";`,
		`import "./real.mjs";`,
		`export { value } from "lib";`,
		`const later = () => import("./dynamic.mjs");`,
		`const legacy = require("./legacy.cjs");`
	].join("\n");
	const parsed = staticModuleRefs(source, MODULE_URL, IMPORT_MAP);
	assert.deepEqual(
		parsed.refs.map(ref => ref.specifier),
		["./real.mjs", "lib"]
	);
	assert.deepEqual(
		parsed.refs.map(ref => ref.url),
		["https://cdn.test/app/real.mjs", "https://cdn.test/lib/index.mjs"]
	);
	assert.equal(parsed.warnings.length, 0);
});

test("module rewrites change only proven specifier spans", () => {
	const source = `import "./real.mjs"; const text = "./real.mjs";`;
	const parsed = staticModuleRefs(source, MODULE_URL, IMPORT_MAP);
	const rewritten = rewriteModuleRefs(source, [{
		end: parsed.refs[0].end,
		start: parsed.refs[0].start,
		value: "/__awtsmoos_remote__/real.mjs"
	}]);
	assert.equal(
		rewritten,
		`import "/__awtsmoos_remote__/real.mjs"; const text = "./real.mjs";`
	);
});
