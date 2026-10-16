// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * The simple lane is not the privileged native tunnel: by default it permits a
 * short set of read-only diagnostics and executes with execFile, never a shell.
 * Explicit TUNNEL_SIMPLE_COMMAND_PROFILE=advanced is a user-selected escape hatch
 * for a native user-owned machine, not something discovery may enable remotely.
 */
const ALLOWED = Object.freeze({
  pwd: [[]],
  whoami: [[]],
  uname: [[], ["-s"], ["-a"], ["-m"]],
  date: [[], ["-u"]],
  git: [["--version"], ["status", "--short"], ["status"], ["rev-parse", "--show-toplevel"]],
  node: [["--version"], ["-v"]],
  npm: [["--version"], ["-v"]]
});

function parse(command) {
  const source = String(command || "");
  if (!source || source.length > 2048 || /[;&|<>`$\\\r\n\x00-\x1f\x7f]/.test(source)) {
    throw new Error("simple_tunnel_command_policy_denied");
  }
  const args = source.trim().split(/ +/).filter(Boolean);
  if (!args.length || args.length > 6) throw new Error("simple_tunnel_command_policy_denied");
  const [program, ...parameters] = args;
  if (program === "echo") {
    if (parameters.length > 5 || parameters.some(x => !/^[a-zA-Z0-9_.:@+-]{1,100}$/.test(x))) {
      throw new Error("simple_tunnel_command_policy_denied");
    }
    return { program: process.execPath, args: ["-p", JSON.stringify(parameters.join(" "))],
      profile: "safe", nativeShell: false };
  }
  if (!Object.prototype.hasOwnProperty.call(ALLOWED, program) ||
    !ALLOWED[program].some(permitted => JSON.stringify(permitted) === JSON.stringify(parameters))) {
    throw new Error("simple_tunnel_command_policy_denied");
  }
  return { program, args: parameters, profile: "safe", nativeShell: false };
}

module.exports = { ALLOWED, parse };
