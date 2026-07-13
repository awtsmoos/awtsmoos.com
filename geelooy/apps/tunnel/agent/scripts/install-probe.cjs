#!/usr/bin/env node
// B"H
const path = require("node:path");
const Probe = require("../release/runtimeProbe.js");

/**
 * B"H — The installer asks this narrow gate whether a candidate can awaken.
 * Its JSON receipt is readable by humans, supervisors, and isolated tests.
 */
const root = path.resolve(process.argv[2] || process.cwd());
const result = Probe.probeRuntime(root);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
