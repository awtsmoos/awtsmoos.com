// B"H
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { buildFsPayload } = require("../tunnelPayload.js");

test("OAuth route preserves the guarded write's expected hash", () => {
	const expectedSha256 = "a".repeat(64);
	const payload = buildFsPayload({
		paramKinds: {
			POST: {
				action: "writeIfHash",
				p: "project/example.txt",
				content: "next",
				expectedSha256
			},
			GET: {}
		}
	});
	assert.equal(payload.action, "writeIfHash");
	assert.equal(payload.expectedSha256, expectedSha256);
	assert.equal(payload.content, "next");
});


test("hosted payload carries exact one-use mission token on top-level POST", () => {
	const missionWriteToken = "wrt_" + "a".repeat(24);
	const payload = buildFsPayload({paramKinds:{POST:{
		action:"write", path:"project/new.cjs", content:"B\"H",
		missionId:"mission-scoped", missionWriteToken
	},GET:{}}});
	assert.equal(payload.action,"write");
	assert.equal(payload.path,"project/new.cjs");
	assert.equal(payload.content,'B"H');
	assert.equal(payload.missionId,"mission-scoped");
	assert.equal(payload.missionWriteToken,missionWriteToken);
});

test("hosted request forwarding retains legacy writeToken alias and rejects malformed tokens", () => {
	const token="wrt_"+"b".repeat(24);
	const old=buildFsPayload({paramKinds:{GET:{action:"write",p:"file.cjs",writeToken:token}}});
	assert.equal(old.missionWriteToken,token);
	for(const bad of [{foo:"evil"},"not-a-grant", "wrt_"+"c".repeat(500)]){
		const payload=buildFsPayload({paramKinds:{POST:{action:"write",path:"file.cjs",missionWriteToken:bad}}});
		assert.equal(payload.missionWriteToken,undefined);
	}
});
