// B"H — CORS bypass proof for the Merkava browser.
//
// A real browser blocks JS from READING a cross-origin response body unless
// the server sends Access-Control-Allow-Origin (CORS). https://example.com
// sends NO such header, so in Chrome/Firefox:
//   await (await fetch("https://example.com")).text()
// from any other origin throws "TypeError: Failed to fetch" (CORS error).
//
// Merkava is a NATIVE client. DirectNet performs the same HTTP request with
// zero CORS semantics and reads the body fully. This test proves it.

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { DirectNet } = require("./DirectNet.js");
const { TunnelRelayNet } = require("./TunnelRelayNet.js");
const { SmartNet } = require("./SmartNet.js");

const PROOF_URL = "https://example.com";
const FORGED_ORIGIN = "https://forged-origin.example";

let pass = 0;
let fail = 0;
function check(name, cond, detail = "") {
	if (cond) { pass++; console.log("  PASS " + name); }
	else { fail++; console.log("  FAIL " + name + (detail ? " — " + detail : "")); }
}

console.log("B\"H — Merkava CORS bypass tests\n");

// 1. DirectNet.proveCorsBypass: server sends no ACAO, body still readable.
console.log("[1] DirectNet.proveCorsBypass");
const proof = await DirectNet.proveCorsBypass(PROOF_URL, FORGED_ORIGIN);
console.log("    status=" + proof.status + " acao=" + JSON.stringify(proof.acaoHeader) +
	" bodyBytes=" + proof.bodyBytes);
check("bypass proven (no ACAO, body readable)", proof.bypassProven === true,
	JSON.stringify(proof.note));
check("body non-trivial", proof.bodyBytes > 100, "got " + proof.bodyBytes);

// 2. Raw directFetch with forged Origin header — full body incl. <title>.
console.log("[2] directFetch with forged Origin");
const raw = await DirectNet.directFetch(PROOF_URL, { headers: { Origin: FORGED_ORIGIN } });
const rawText = raw.body.toString("utf8");
check("status 200", raw.status === 200, "got " + raw.status);
check("no ACAO header evaluated", raw.headers["access-control-allow-origin"] === undefined);
check("title tag readable (browser would block this)", rawText.includes("<title>"));

// 3. SmartNet auto mode routes direct.
console.log("[3] SmartNet smartFetch (auto)");
let routeSeen = null;
const smart = await SmartNet.smartFetch(PROOF_URL, {
	onRoute: r => { routeSeen = r; }
});
check("route=direct", smart.route === "direct" && routeSeen === "direct",
	"route=" + smart.route);
check("body readable via smartFetch", smart.body.length > 100);

// 4. Tunnel relay fallback via test invoker (same semantics the real tunnel host provides).
console.log("[4] TunnelRelayNet relayFetch (test invoker)");
const testInvoker = TunnelRelayNet.createTestInvoker();
testInvoker.setDirectNet(DirectNet);
const relay = TunnelRelayNet.createTunnelRelay(testInvoker.invoke.bind(testInvoker));
const relayed = await relay.relayFetch(PROOF_URL, { headers: { Origin: FORGED_ORIGIN } });
check("relayed flag", relayed.relayed === true);
check("status 200 via relay", relayed.status === 200, "got " + relayed.status);
check("body readable via relay", relayed.body.length > 100,
	"got " + relayed.body.length);

// 5. SmartNet forced-relay mode.
console.log("[5] SmartNet forced relay mode");
const smartRelay = await SmartNet.smartFetch(PROOF_URL, {
	mode: "relay",
	relayInvoke: testInvoker.invoke.bind(testInvoker)
});
check("route=relay", smartRelay.route === "relay", "route=" + smartRelay.route);
check("body readable via forced relay", smartRelay.body.length > 100);

// 6. bindPageNet: page-level fetch() is CORS-free.
console.log("[6] bindPageNet page-level fetch");
const fakeWindow = {};
SmartNet.bindPageNet(fakeWindow, {});
check("window.fetch installed", typeof fakeWindow.fetch === "function");
check("window.XMLHttpRequest installed", typeof fakeWindow.XMLHttpRequest === "function");
const pageRes = await fakeWindow.fetch(PROOF_URL);
const pageText = await pageRes.text();
check("page fetch ok", pageRes.ok === true && pageRes.status === 200);
check("page body readable cross-origin", pageText.includes("<title>"));

// 7. XHR smoke test.
console.log("[7] PageXMLHttpRequest smoke");
await new Promise(resolve => {
	const xhr = new fakeWindow.XMLHttpRequest();
	xhr.onload = () => {
		check("xhr status 200", xhr.status === 200, "got " + xhr.status);
		check("xhr responseText readable", xhr.responseText.includes("<title>"));
		resolve();
	};
	xhr.onerror = () => { check("xhr no error", false, "onerror fired"); resolve(); };
	xhr.open("GET", PROOF_URL);
	xhr.send();
});

console.log("\nB\"H — " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
