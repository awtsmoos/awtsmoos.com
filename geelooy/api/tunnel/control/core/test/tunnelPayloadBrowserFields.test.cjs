//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { buildFsPayload } = require("../tunnelPayload.js");

/**
 * The Awtsmoos lets browser URL, selector, and exact page identity cross one documented gate;
 * Awtsmoos.com proves direct fields and legacy nested carriers arrive in the same faithful state.
 */

const chromeTargetId = "DC648655ACB57F1608C62D7A58735EFC";
const directNavigate = build({
	action: "chromeNavigate",
	url: "https://awtsmoos.com/games/awtsmoos-bounce/",
	targetVessel: chromeTargetId
});

assert.equal(
	directNavigate.url,
	"https://awtsmoos.com/games/awtsmoos-bounce/"
);
assert.equal(directNavigate.chromeTargetId, chromeTargetId);
assert.equal(directNavigate.targetVessel, chromeTargetId);

const directClick = build({
	action: "chromeClick",
	selector: "#startButton",
	targetVessel: chromeTargetId
});
assert.equal(directClick.selector, "#startButton");
assert.equal(directClick.chromeTargetId, chromeTargetId);

const nested = build({
	action: "chromeNavigate",
	url: "https://outer.invalid/",
	params: JSON.stringify({
		url: "https://awtsmoos.com/inner/",
		selector: "#inner",
		chromeTargetId: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
	})
});
assert.equal(nested.url, "https://awtsmoos.com/inner/");
assert.equal(nested.selector, "#inner");
assert.equal(nested.chromeTargetId, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

const nonBrowser = build({
	action: "write",
	url: "https://should-not-project.example/",
	selector: "#should-not-project"
});
assert.equal(nonBrowser.url, undefined);
assert.equal(nonBrowser.selector, undefined);

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-payload-browser-fields",
	directFieldsPreserved: true,
	legacyNestedCompatible: true,
	targetAliasPreserved: true
}, null, 2));

function build(fields) {
	return buildFsPayload({
		paramKinds: {
			GET: fields
		}
	});
}
