// B"H
import assert from "node:assert/strict";
import { BACKEND_FEATURES, hasFeature, normalizeBackend } from "../backend-contract.js";

const backend = normalizeBackend({ kind: "webgl" }, { features: [BACKEND_FEATURES.sprites] });
assert.equal(backend.contract.version, 1);
assert.equal(hasFeature(backend, BACKEND_FEATURES.webgl), true);
assert.equal(hasFeature(backend, BACKEND_FEATURES.sprites), true);
assert.equal(hasFeature(backend, BACKEND_FEATURES.webgpu), false);
console.log("backend contract ok");
