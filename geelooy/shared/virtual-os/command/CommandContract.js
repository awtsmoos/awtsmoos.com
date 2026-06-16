// B"H
/**
 * B"H
 * Chapter 59: Every command learned to return with the same face.
 */
export function normalizeCommandText(command = "") {
  return String(command || "").trim();
}

export function commandOk({ command = "", cwd = ".", stdout = "", stderr = "", exitCode = 0, simulated = false, vessel = "unknown", durationMs = 0, data = {} } = {}) {
  return {
    ok: exitCode === 0,
    action: "commandRun",
    command: normalizeCommandText(command),
    cwd,
    stdout: String(stdout ?? ""),
    stderr: String(stderr ?? ""),
    exitCode: Number(exitCode || 0),
    simulated: Boolean(simulated),
    vessel,
    durationMs: Number(durationMs || 0),
    ...data
  };
}

export function commandFail({ command = "", cwd = ".", error = "command_failed", simulated = false, vessel = "unknown", durationMs = 0, exitCode = 1, data = {} } = {}) {
  return commandOk({ command, cwd, stdout: "", stderr: error?.message || String(error), exitCode, simulated, vessel, durationMs, data: { error: error?.code || "command_failed", ...data } });
}

export function commandCapabilities({ vessel = "unknown", simulated = false, nativeShell = false, commands = [] } = {}) {
  return { vessel, action: "commandRun", simulated: Boolean(simulated), nativeShell: Boolean(nativeShell), commands: [...commands] };
}

export function assertCommandContract(result) {
  if (!result || result.action !== "commandRun") throw new Error("command_contract_action_missing");
  if (typeof result.ok !== "boolean") throw new Error("command_contract_ok_boolean_missing");
  if (typeof result.stdout !== "string") throw new Error("command_contract_stdout_string_missing");
  if (typeof result.stderr !== "string") throw new Error("command_contract_stderr_string_missing");
  if (typeof result.exitCode !== "number") throw new Error("command_contract_exit_code_number_missing");
  return true;
}
