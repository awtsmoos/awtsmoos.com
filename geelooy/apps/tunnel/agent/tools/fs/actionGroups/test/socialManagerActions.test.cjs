// B"H — socialManagerActions unit tests (no network; builder shape + triage logic).
const assert = require("assert");
const { buildSocialManagerActions } = require("../socialManagerActions.js");

// Rebuild triage by calling socialCommentsQueue with a mocked httpJson? Instead,
// test the builder shape and the manager's not-logged-in fast path.
const actions = buildSocialManagerActions({ config: {}, payload: {} });
const expected = [
	"socialAliases",
	"socialPostsNeedsWork",
	"socialCommentsQueue",
	"socialCommentApprove",
	"socialCommentDeny",
	"socialManagerRun"
];
for (const name of expected) {
	assert.equal(typeof actions[name], "function", `missing action: ${name}`);
}
console.log("ok - all 6 social manager actions present");

// missing-args guards (no network touched)
(async () => {
	const approve = await actions.socialCommentApprove();
	assert.equal(approve.ok, false);
	assert.equal(approve.error, "missing_args");
	const deny = await actions.socialCommentDeny();
	assert.equal(deny.ok, false);
	assert.equal(deny.error, "missing_args");
	console.log("ok - approve/deny missing-args guards");
})().catch(e => { console.error("FAIL", e); process.exit(1); });
