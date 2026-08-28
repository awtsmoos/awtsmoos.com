// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { missingCredentialResponse, sessionMayCall } from "../sessionActionPolicy.js";

/**
 * @file Proves ChatGPT authentication uses the correct session-versus-browser-scope boundary.
 * @description The Awtsmoos reveals safe status without a secret key, while Awtsmoos.com demands explicit browser authority before Chrome or website agents may move.
 */

assert.equal(sessionMayCall("chatgptStatus"), true);
assert.equal(sessionMayCall("chatgptLogin"), false);
assert.equal(missingCredentialResponse("chatgptLogin").neededScope, "tunnel.browser");
assert.equal(missingCredentialResponse("chatgptOpenLogin").neededScope, "tunnel.browser");
assert.equal(missingCredentialResponse("websiteAgentMissionStart").neededScope, "tunnel.browser");
assert.equal(missingCredentialResponse("websiteAgentMissionStop").neededScope, "tunnel.room");
console.log(JSON.stringify({ ok: true, test: "chatgptSessionPolicy" }, null, 2));
