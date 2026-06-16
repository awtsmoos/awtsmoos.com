// B"H
import assert from "assert";
import { assertCommandContract, commandCapabilities, commandFail, commandOk, normalizeCommandText } from "../CommandContract.js";

assert.strictEqual(normalizeCommandText("  ls  "), "ls");
const ok = commandOk({ command: "pwd", cwd: "/", stdout: "/", simulated: true, vessel: "browser-tab", durationMs: 3 });
assert.strictEqual(ok.ok, true);
assert.strictEqual(ok.vessel, "browser-tab");
assert.strictEqual(ok.exitCode, 0);
assertCommandContract(ok);
const fail = commandFail({ command: "node x", cwd: ".", error: "no", simulated: true, vessel: "browser-storage" });
assert.strictEqual(fail.ok, false);
assert.strictEqual(fail.exitCode, 1);
assert.strictEqual(fail.stderr, "no");
assertCommandContract(fail);
const caps = commandCapabilities({ vessel: "native", nativeShell: true, commands: ["node"] });
assert.strictEqual(caps.nativeShell, true);
assert.deepStrictEqual(caps.commands, ["node"]);
assert.throws(() => assertCommandContract({}), /command_contract_action_missing/);
console.log("BHY CommandContract tests passed");
