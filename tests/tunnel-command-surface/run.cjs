// B"H
const assert = require("assert");
const { spawnSync } = require("child_process");
const path = require("path");

const tests = [
  "actionAliasFinishStress.test.cjs",
  "agentWorkflow.test.cjs",
  "catalog.test.cjs",
  "commandFamilies.test.cjs",
  "commandParserStress.test.cjs",
  "commandTree.test.cjs",
  "commandTreeControlStress.test.cjs",
  "commandTreeFailureStress.test.cjs",
  "continuationPrompt.test.cjs",
  "dispatchAliases.test.cjs",
  "manifestHashes.test.cjs",
  "merkavaDeviceStress.mjs",
  "merkavaExecutorErrors.test.cjs",
  "merkavaExecutorStress.test.cjs",
  "merkavaModuleHtmlStress.mjs",
  "merkavaNodeDeviceStress.mjs",
  "merkavaServiceStress.mjs",
  "openApiYamlStress.test.cjs",
  "plainPayload.test.cjs",
  "runtimeActionsPreflight.test.cjs",
  "runtimeVirtualEnv.test.cjs",
  "tunnelPayload.test.cjs",
  "writeVerification.test.cjs"
];

const unique = [...new Set(tests)];
assert.deepEqual(unique, tests, "duplicate test entries");

let failed = 0;
for (const file of tests) {
  const full = path.join(__dirname, file);
  const result = spawnSync(process.execPath, [full], { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const ok = result.status === 0;
  console.log(`${ok ? "PASS" : "FAIL"} ${file}`);
  if (!ok) failed += 1;
}

if (failed) process.exit(1);
console.log(`B'H all ${tests.length} tunnel command-surface tests passed`);
