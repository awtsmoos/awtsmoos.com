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
	assert.equal(report.version, "0.93.0");
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


test("review submission rejects extra cases beyond exactly five and three",()=>{
 const source=path.resolve(__dirname,"../../plugins/awtsmoos-shliach");
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"awts-plugin-review-"));
 try{
  fs.cpSync(source,tmp,{recursive:true});
  const p=path.join(tmp,"plugin.json"),data=JSON.parse(fs.readFileSync(p,"utf8"));
  const cases=data.extensions["com.openai"].review.test_cases;
  assert.equal(cases.positive.length,5);assert.equal(cases.negative.length,3);
  cases.positive.push({...cases.positive[0]});cases.negative.push({...cases.negative[0]});
  fs.writeFileSync(p,JSON.stringify(data));
  const report=validate(tmp);assert.equal(report.ok,false);
  assert(report.errors.includes("review_requires_exactly_five_positive_cases"));
  assert(report.errors.includes("review_requires_exactly_three_negative_cases"));
 }finally{fs.rmSync(tmp,{force:true,recursive:true});}
});
