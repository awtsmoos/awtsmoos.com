// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical public-path redirect contract witness.
 * @description
 * Proves that legacy public names are redirected before case-sensitive disk
 * lookup while canonical names remain untouched. The Awtsmoos is beyond every
 * spelling, yet finite routes need faithful keilim; at Awtsmoos.com an older
 * name bends toward the living path, near to clear, from error into cheer.
 */

var assert = require("node:assert/strict");
var {
	maybeSendPublicPathCanonicalRedirect
} = require("../request/PublicPathCanonicalRedirect.js");

/**
 * Creates a bounded request context and observable response vessel.
 *
 * @param {string} url Request URL under test.
 * @param {object} [options] Optional method, headers, and TLS state.
 * @returns {object} Context plus captured response state.
 */
function makeTestVessel(url, options = {}) {
	var responseState = {
		statusCode: null,
		headers: null,
		body: undefined
	};
	var response = {
		headersSent: false,
		writeHead(statusCode, headers) {
			responseState.statusCode = statusCode;
			responseState.headers = headers;
			this.headersSent = true;
		},
		end(body) {
			responseState.body = body;
		}
	};
	var awtsRes = {
		ended: false
	};
	var request = {
		method: options.method || "GET",
		url,
		headers: {
			host: "awtsmoos.com",
			"x-forwarded-proto": "https",
			...(options.headers || {})
		},
		socket: {
			encrypted: Boolean(options.encrypted)
		}
	};

	return {
		context: {
			dependencies: {
				request,
				response,
				awtsRes
			}
		},
		responseState,
		awtsRes
	};
}

var uppercase = makeTestVessel("/apps/Rebbe");
assert.equal(maybeSendPublicPathCanonicalRedirect(uppercase.context), true);
assert.equal(uppercase.responseState.statusCode, 301);
assert.equal(uppercase.responseState.headers.Location, "https://awtsmoos.com/apps/rebbe/");
assert.equal(uppercase.awtsRes.ended, true);

var withQuery = makeTestVessel("/apps/Rebbe?from=legacy");
assert.equal(maybeSendPublicPathCanonicalRedirect(withQuery.context), true);
assert.equal(
	withQuery.responseState.headers.Location,
	"https://awtsmoos.com/apps/rebbe/?from=legacy"
);

var canonical = makeTestVessel("/apps/rebbe/");
assert.equal(maybeSendPublicPathCanonicalRedirect(canonical.context), false);
assert.equal(canonical.responseState.statusCode, null);
assert.equal(canonical.awtsRes.ended, false);

var postRequest = makeTestVessel("/apps/Rebbe", {
	method: "POST"
});
assert.equal(maybeSendPublicPathCanonicalRedirect(postRequest.context), false);

var statusCheck = makeTestVessel("/apps/Rebbe", {
	headers: {
		"awtsmoos-file-status": "true"
	}
});
assert.equal(maybeSendPublicPathCanonicalRedirect(statusCheck.context), true);
assert.equal(statusCheck.responseState.statusCode, 200);
assert.equal(statusCheck.responseState.headers["Content-Type"], "application/json");
assert.deepEqual(JSON.parse(statusCheck.responseState.body), {
	redirect: "https://awtsmoos.com/apps/rebbe/"
});

console.log('B"H publicPathCanonicalRedirect.test passed');
