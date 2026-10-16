//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");
const { validate } = require("./verifyPluginSubmission.cjs");

test("shliach publication archive validates its live MCP, skills and privacy references", () => {
	const report = validate();
	assert.equal(report.ok, true, JSON.stringify(report.errors));
	assert.equal(report.version, "0.91.0");
	assert(report.files >= 65);
});

test("publication refuses a modified package with mismatched version and absent scope disclosure", () => {
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "awts-plugin-check-"));
	const source = path.resolve(__dirname,"../../plugins/awtsmoos-shliach");
	try {
		fs.cpSync(source,tmp,{recursive:true});
		const meta = path.join(tmp, "plugin.json");
		const body = JSON.parse(fs.readFileSync(meta,"utf8"));
		body.version = "9.9.9";
		body.extensions["com.openai"].review.commerce = false;
		fs.writeFileSync(meta,JSON.stringify(body));
		const result = validate(tmp);
		assert.equal(result.ok,false);
		assert(result.errors.includes("versions_inconsistent"));
		assert(result.errors.includes("external_credit_disclosure_missing"));
	} finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});
