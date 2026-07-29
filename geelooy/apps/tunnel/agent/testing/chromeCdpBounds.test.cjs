// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(
	path.resolve(__dirname, "../tools/chrome/cdp.js"),
	"utf8"
);

test("CDP HTTP and socket operations remain bounded and recoverable", () => {
	assert.match(source, /AWTSMOOS_CDP_HTTP_MAX_BYTES/);
	assert.match(source, /Chrome DevTools HTTP response too large/);
	assert.match(source, /request\.setTimeout\(/);
	assert.match(source, /HTTP timeout for/);
	assert.match(source, /function retireSocket\(/);
	assert.match(source, /if \(pageWs !== socket\) return/);
	assert.match(source, /function dropCurrentSocket\(/);
	assert.match(source, /await reconnectCurrent\(timeoutMs\)/);
	assert.match(source, /callbacks\.set\(id,/);
	assert.ok(
		source.indexOf("callbacks.set(id,")
			< source.indexOf("pageWs.sendJson({ id, method, params })"),
		"the callback must exist before a fast DevTools response can arrive"
	);
});
